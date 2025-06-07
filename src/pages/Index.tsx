
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Users, Mic, Eye } from 'lucide-react';
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20" style={{ paddingTop: '20px', paddingBottom: '10px', maxWidth: '65rem' }}>
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            Stream with
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> AI Power</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Create your own streaming channel with AI-powered transcription, mood detection.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg">
                Start Streaming
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* AI Features */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20" style={{ paddingBottom: '20px' }}>
        <h2 className="text-4xl font-bold text-white text-center mb-12">AI-Powered Features</h2>
        <div className="grid md:grid-cols-2 gap-8">
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
        </div>
      </div>


      {/* Team */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20" style={{ paddingTop: '20px' }}>
        <h2 className="text-4xl font-bold text-white text-center mb-12">Hackathon AI Team</h2>
        <div className="flex justify-center">
          <Card className="bg-black/30 border border-purple-400/30 backdrop-blur-md text-center hover:border-purple-400/50 transition-all duration-300 hover:scale-105 shadow-lg w-full max-w-md rounded-2xl p-6">
            <CardHeader className="text-center space-y-4">
              <Users className="h-12 w-12 text-purple-400 mx-auto" />
              <CardTitle className="text-white text-2xl font-semibold">Collaborators</CardTitle>
              <CardDescription className="text-gray-300 text-base leading-relaxed">
                <ul className="space-y-2">
                  <li>Ravi Jaiswal</li>
                  <li>Pankti Patel</li>
                  <li>Jenish Paladiya</li>
                  <li>Janki Thakkar</li>
                  <li>Ashish Patel</li>
                </ul>
              </CardDescription>
            </CardHeader>
          </Card>
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
            <p className="text-gray-400">© 2025 StreamAI. Crafted by Team Triveni Hackathon 2025.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
