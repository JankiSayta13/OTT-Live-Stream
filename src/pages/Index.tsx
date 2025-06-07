
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Users, Mic, Brain, Eye, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  const [liveChannels] = useState([
    { id: '1', name: 'Tech Talk Live', viewers: 1234, category: 'Technology' },
    { id: '2', name: 'Cooking Masterclass', viewers: 892, category: 'Lifestyle' },
    { id: '3', name: 'Gaming Arena', viewers: 2156, category: 'Gaming' },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Navigation */}
      <nav className="backdrop-blur-sm bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Video className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">StreamAI</span>
            </div>
            <div className="flex space-x-4">
              {user ? (
                <Link to="/dashboard">
                  <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            Stream with
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> AI Power</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Create your own streaming channel with AI-powered transcription, mood detection, and real-time analytics.
            Broadcasting has never been this intelligent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg">
                Start Streaming
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-4 text-lg">
              Watch Streams
            </Button>
          </div>
        </div>
      </div>

      {/* AI Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-12">AI-Powered Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-black/20 border-purple-400/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <Mic className="h-12 w-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">Live Transcription</CardTitle>
              <CardDescription className="text-gray-300">
                Real-time speech-to-text conversion with automatic captions for all viewers
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-black/20 border-purple-400/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <Eye className="h-12 w-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">Mood Detection</CardTitle>
              <CardDescription className="text-gray-300">
                AI analyzes facial expressions to show your mood in real-time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-black/20 border-purple-400/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <Brain className="h-12 w-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">Smart Analytics</CardTitle>
              <CardDescription className="text-gray-300">
                Intelligent insights about viewer engagement and stream performance
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Live Channels */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-12">Live Now</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {liveChannels.map((channel) => (
            <Card key={channel.id} className="bg-black/20 border-red-400/20 backdrop-blur-sm hover:border-red-400/40 transition-all duration-300 group cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-400 font-semibold">LIVE</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-300">
                    <Users className="h-4 w-4" />
                    <span>{channel.viewers.toLocaleString()}</span>
                  </div>
                </div>
                <CardTitle className="text-white group-hover:text-purple-400 transition-colors">
                  {channel.name}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {channel.category}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                  <Video className="h-16 w-16 text-gray-600" />
                </div>
                <Link to={`/watch/${channel.id}`}>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Watch Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 border-t border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Video className="h-6 w-6 text-purple-400" />
              <span className="text-white font-semibold">StreamAI</span>
            </div>
            <p className="text-gray-400">© 2024 StreamAI. Powered by AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
