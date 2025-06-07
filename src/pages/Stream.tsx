import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, Clock, Mic, MicOff, Users, Settings, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SpeechToText } from '@/components/SpeechToText';
import { MoodDetection } from '@/components/MoodDetection';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Stream = () => {
  const { channelId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [streamDuration, setStreamDuration] = useState(0);
  const [mood, setMood] = useState<string>('Neutral');
  const [transcript, setTranscript] = useState<string>('');
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const streamTimer = useRef<NodeJS.Timeout>();
  const viewerCountTimer = useRef<NodeJS.Timeout>();
  const realtimeChannel = useRef<any>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    initializeCamera();

    return () => {
      cleanup();
    };
  }, [user, navigate]);

  // Handle viewer offers and ICE candidates
  useEffect(() => {
    if (isStreaming && currentStreamId && mediaStream) {
      realtimeChannel.current = supabase
        .channel(`stream_${currentStreamId}`)
        .on('broadcast', { event: 'viewer_offer' }, async (payload) => {
          console.log('Received viewer offer:', payload);
          const { offer, viewerId } = payload.payload;

          try {
            const configuration = {
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
              ]
            };

            const peerConnection = new RTCPeerConnection(configuration);
            peerConnections.current.set(viewerId, peerConnection);

            // Add local tracks to the peer connection
            mediaStream.getTracks().forEach(track => {
              console.log('Adding track to peer connection:', track.kind);
              peerConnection.addTrack(track, mediaStream);
            });

            // Handle ICE candidates
            peerConnection.onicecandidate = (event) => {
              if (event.candidate) {
                console.log('Sending ICE candidate to viewer:', viewerId);
                realtimeChannel.current?.send({
                  type: 'broadcast',
                  event: 'streamer_ice_candidate',
                  payload: {
                    candidate: event.candidate,
                    viewerId: viewerId
                  }
                });
              }
            };

            // Handle connection state changes
            peerConnection.onconnectionstatechange = () => {
              console.log('Connection state with viewer', viewerId, ':', peerConnection.connectionState);
              if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
                console.log('Removing disconnected peer connection for viewer:', viewerId);
                peerConnection.close();
                peerConnections.current.delete(viewerId);
              }
            };

            // Set remote description from viewer's offer
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

            // Create and send answer
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            console.log('Sending answer to viewer:', viewerId);
            realtimeChannel.current?.send({
              type: 'broadcast',
              event: 'streamer_answer',
              payload: {
                answer: peerConnection.localDescription,
                viewerId: viewerId
              }
            });

          } catch (error) {
            console.error('Error handling viewer offer:', error);
            toast({
              title: "Connection Error",
              description: "Failed to establish connection with viewer",
              variant: "destructive",
            });
          }
        })
        .on('broadcast', { event: 'ice_candidate' }, async (payload) => {
          console.log('Received ICE candidate from viewer:', payload);
          const { candidate, viewerId } = payload.payload;

          try {
            const peerConnection = peerConnections.current.get(viewerId);
            if (peerConnection) {
              await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
              console.log('Added ICE candidate from viewer:', viewerId);
            }
          } catch (error) {
            console.error('Error adding ICE candidate from viewer:', error);
          }
        })
        .subscribe();

      return () => {
        if (realtimeChannel.current) {
          supabase.removeChannel(realtimeChannel.current);
        }
      };
    }
  }, [isStreaming, currentStreamId, mediaStream]);

  const constraints: MediaStreamConstraints = {
    video: {
      width: 1280,
      height: 720,
      // either remove facingMode:
      // facingMode: undefined,

      // —or— make it ideal instead of required:
      facingMode: { ideal: "user" }
    },
    audio: true
  };

  const initializeCamera = async () => {
    if (window.location.protocol !== 'https:') {
      console.warn('⚠️ WebRTC requires HTTPS. You are running on', window.location.protocol);
    }
    try {
      console.log('Initializing streamer camera...');
      console.log('Requesting camera/mic permission...');

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // const stream = await navigator.mediaDevices.getUserMedia({
      //   video: { width: 1280, height: 720, facingMode: 'user' },
      //   audio: true
      // });

      setMediaStream(stream);

      stream.getTracks().forEach(track => {
        peerConnections.current.forEach((pc, viewerId) => {
          pc.addTrack(track, stream);
          console.log(`✅ Added ${track.kind} track to peerConnection for viewer ${viewerId}`);
        });
      });

      console.log('Media stream tracks:', stream.getTracks());

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        console.log('Streamer camera initialized successfully');
        toast({
          title: "Camera Ready",
          description: "Your camera is ready to stream",
        });
      }

    } catch (err) {
      console.error("Error accessing camera:", err);

      if (err.name === "NotFoundError") {
        toast({
          title: "No Camera Found",
          description: "We couldn’t find any camera matching your settings. Please connect a webcam or try again without a specific facingMode.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Camera Error",
          description: "Unable to access camera. Please check permissions.",
          variant: "destructive",
        });
      }
    }
  };


  const cleanup = () => {
    console.log('Cleaning up stream...');

    // Close all peer connections
    peerConnections.current.forEach((pc, viewerId) => {
      pc.close();
      console.log('Closed peer connection for viewer:', viewerId);
    });
    peerConnections.current.clear();

    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (streamTimer.current) {
      clearInterval(streamTimer.current);
    }

    if (viewerCountTimer.current) {
      clearInterval(viewerCountTimer.current);
    }

    if (realtimeChannel.current) {
      supabase.removeChannel(realtimeChannel.current);
    }

    // Clear stream data
    if (channelId) {
      // localStorage.removeItem(`live_stream_${channelId}`);
    }
  };

  const startStream = async () => {
    try {
      console.log('Starting stream for channel:', channelId);

      if (!mediaStream) {
        await initializeCamera();
      }

      // Create stream record in database
      const { data: streamData, error: streamError } = await supabase
        .from('streams')
        .insert({
          channel_id: channelId,
          title: `${user?.channelName || 'Live Stream'}`,
          is_live: true,
          started_at: new Date().toISOString(),
          viewer_count: 0
        })
        .select()
        .single();

      if (streamError) {
        console.error('Error creating stream:', streamError);
        toast({
          title: "Stream Error",
          description: "Failed to start stream. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Update channel to live status
      const { error: channelError } = await supabase
        .from('channels')
        .update({ is_live: true })
        .eq('id', channelId);

      if (channelError) {
        console.error('Error updating channel status:', channelError);
      }

      setCurrentStreamId(streamData.id);
      setIsStreaming(true);
      setStreamDuration(0);
      setViewerCount(0);

      console.log('Stream started successfully. Stream ID:', streamData.id);

      toast({
        title: "🔴 Stream Started!",
        description: "You are now live streaming",
      });

      // Start duration timer
      streamTimer.current = setInterval(() => {
        setStreamDuration(prev => prev + 1);
      }, 1000);

      // Update viewer count every 5 seconds
      viewerCountTimer.current = setInterval(async () => {
        if (streamData.id) {
          const { data: viewers } = await supabase
            .from('viewers')
            .select('id')
            .eq('stream_id', streamData.id)
            .is('left_at', null);

          const count = viewers?.length || 0;
          setViewerCount(count);

          // Update viewer count in database
          await supabase
            .from('streams')
            .update({ viewer_count: count })
            .eq('id', streamData.id);
        }
      }, 5000);

    } catch (error) {
      console.error('Error starting stream:', error);
      toast({
        title: "Stream Error",
        description: "Failed to start stream",
        variant: "destructive",
      });
    }
  };

  const stopStream = async () => {
    try {
      console.log('Stopping stream...');

      if (currentStreamId) {
        // Update stream record
        await supabase
          .from('streams')
          .update({
            is_live: false,
            ended_at: new Date().toISOString()
          })
          .eq('id', currentStreamId);

        // Update all viewers to left
        await supabase
          .from('viewers')
          .update({ left_at: new Date().toISOString() })
          .eq('stream_id', currentStreamId)
          .is('left_at', null);
      }

      // Update channel to offline status
      await supabase
        .from('channels')
        .update({ is_live: false })
        .eq('id', channelId);

      // Clear stream data
      // localStorage.removeItem(`live_stream_${channelId}`);

      setIsStreaming(false);
      setCurrentStreamId(null);

      if (streamTimer.current) {
        clearInterval(streamTimer.current);
      }
      if (viewerCountTimer.current) {
        clearInterval(viewerCountTimer.current);
      }

      console.log('Stream stopped successfully');

      toast({
        title: "Stream Ended",
        description: "Your stream has been stopped",
      });

    } catch (error) {
      console.error('Error stopping stream:', error);
      toast({
        title: "Error",
        description: "Failed to stop stream properly",
        variant: "destructive",
      });
    }
  };

  const toggleStream = async () => {
    if (isStreaming) {
      await stopStream();
    } else {
      await startStream();
    }
  };

  const toggleVideo = async () => {
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);

      toast({
        title: isVideoEnabled ? "Video Disabled" : "Video Enabled",
        description: `Camera is now ${isVideoEnabled ? "off" : "on"}`,
      });
    }
  };

  const toggleAudio = async () => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(!isAudioEnabled);

      toast({
        title: isAudioEnabled ? "Audio Muted" : "Audio Unmuted",
        description: `Microphone is now ${isAudioEnabled ? "off" : "on"}`,
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleMoodChange = (detectedMood: string) => {
    setMood(detectedMood);
  };

  const handleTranscriptChange = (text: string) => {
    setTranscript(text);
  };

  const endStream = async () => {
    if (isStreaming) {
      await stopStream();
    }
    navigate('/dashboard');
  };

  const getCurrentDomain = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'http://localhost:8080';
  };

  const copyWatchLink = () => {
    const watchUrl = `${getCurrentDomain()}/watch/${channelId}`;
    navigator.clipboard.writeText(watchUrl);
    toast({
      title: "Link copied!",
      description: "Watch link copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">{user?.channelName}</h1>
                <p className="text-gray-300">Channel ID: {channelId}</p>
                {isStreaming && (
                  <p className="text-green-400 font-semibold">🔴 LIVE</p>
                )}
              </div>
              <div className="flex gap-2">
              <Button
                  onClick={copyWatchLink}
                  variant="ghost"
                  className="bg-green-600 hover:bg-green-700 hover:text-white text-white"
                >
                  Copy Watch Link
                </Button>
                <Button
                  onClick={endStream}
                  variant="ghost"
                  className="bg-red-600 hover:bg-red-700 hover:text-white text-white"
                >
                  <X className="h-4 w-4 mr-2" />
                  End Stream
                </Button>
              </div>
            </div>

            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg bg-black aspect-video object-cover"
              />

              {/* Live badge */}
              {isStreaming && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-600 text-white">
                    <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                    LIVE
                  </Badge>
                </div>
              )}

              {/* Stream info overlay */}
              {isStreaming && (
                <div className="absolute top-4 right-4 flex items-center space-x-3">
                  <Badge className="bg-black/50 backdrop-blur-sm border-white/10">
                    <ClockIcon className="h-4 w-4 mr-1 text-gray-300" />
                    {formatDuration(streamDuration)}
                  </Badge>
                  <Badge className="bg-black/50 backdrop-blur-sm border-white/10">
                    <Users className="h-4 w-4 mr-1 text-gray-300" />
                    {viewerCount}
                  </Badge>
                </div>
              )}

              {/* Mood detection overlay */}
              {isStreaming && (
                <div className="absolute top-16 right-4">
                  <Badge className="bg-black/50 backdrop-blur-sm border-white/10">
                    Mood: {mood === 'Happy' ? '😊' : mood === 'Sad' ? '😔' : '😐'} {mood}
                  </Badge>
                </div>
              )}

              {/* Captions */}
              {isStreaming && transcript && (
                <div className="absolute bottom-8 left-0 right-0 mx-auto w-4/5 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white text-center">
                  {transcript}
                </div>
              )}

              {/* Camera status overlay */}
              {!isVideoEnabled && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <VideoOff className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-between">
              <div className="flex space-x-2">
                <Button
                  onClick={toggleStream}
                  className={isStreaming ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                >
                  {isStreaming ? 'Stop Stream' : 'Start Stream'}
                </Button>
                <Button variant="outline" onClick={toggleVideo} className="border-white/10">
                  {isVideoEnabled ? <Video className="h-4 w-4 mr-2" /> : <VideoOff className="h-4 w-4 mr-2" />}
                  {isVideoEnabled ? 'Camera On' : 'Camera Off'}
                </Button>
                <Button variant="outline" onClick={toggleAudio} className="border-white/10">
                  {isAudioEnabled ? <Mic className="h-4 w-4 mr-2" /> : <MicOff className="h-4 w-4 mr-2" />}
                  {isAudioEnabled ? 'Mic On' : 'Mic Off'}
                </Button>
              </div>
               {/* <Button variant="outline" className="border-white/10">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button> */}
            </div>
          </div>

          {/* Chat and Status */}
          <div className="w-full md:w-80">
            <Card className="bg-black/20 border-purple-400/20 backdrop-blur-sm mb-4">
              <CardHeader>
                <CardTitle className="text-white text-lg">Stream Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Status:</span>
                  <Badge variant={isStreaming ? "destructive" : "secondary"} className={isStreaming ? "bg-red-600" : "bg-gray-600"}>
                    {isStreaming ? "LIVE" : "OFFLINE"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Viewers:</span>
                  <span className="text-white">{viewerCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Duration:</span>
                  <span className="text-white">{formatDuration(streamDuration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Mood:</span>
                  <span className="text-white">{mood}</span>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-gray-400">Share this stream:</p>
                  <p className="text-xs text-white font-mono break-all bg-gray-800/50 p-1 rounded mt-1">
                    {getCurrentDomain()}/watch/{channelId}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 border-purple-400/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Live Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 overflow-y-auto text-gray-300 bg-black/30 rounded-md p-3 mb-3">
                  {isStreaming ? (
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white text-xs">JD</span>
                        </div>
                        <div>
                          <span className="font-semibold text-white">JohnDoe</span>
                          <p className="text-sm">Hey, great stream!</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                          <span className="text-white text-xs">AS</span>
                        </div>
                        <div>
                          <span className="font-semibold text-white">AliceSmith</span>
                          <p className="text-sm">Love the AI features!</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                          <span className="text-white text-xs">BT</span>
                        </div>
                        <div>
                          <span className="font-semibold text-white">BobTech</span>
                          <p className="text-sm">The transcription is working perfectly!</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">Chat available when streaming</p>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="text"
                     placeholder="coming soon...."
                    disabled={!isStreaming}
                    className="flex-1 rounded-l-md py-2 px-3 bg-white/10 border-r-0 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none"
                  />
                  <Button disabled={true} className="rounded-l-none bg-purple-600 hover:bg-purple-700">
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Hidden components that handle AI features */}
      {isStreaming && (
        <>
          <MoodDetection videoRef={videoRef} onMoodChange={handleMoodChange} />
          <SpeechToText isActive={isStreaming && isAudioEnabled} onTranscriptChange={handleTranscriptChange} />
        </>
      )}
    </div>
  );
};

const ClockIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

export default Stream;
