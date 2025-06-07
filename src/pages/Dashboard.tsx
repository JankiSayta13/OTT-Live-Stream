
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Users, Eye, Clock, Settings, LogOut, Radio } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalViews: 0,
    totalStreams: 0,
    avgViewTime: '0 min',
    lastStream: 'Never'
  });

  const [recentStreams, setRecentStreams] = useState<any[]>([]);
  const [channelId, setChannelId] = useState<string>('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Get user's channel
      const { data: channel } = await supabase
        .from('channels')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (channel) {
        setChannelId(channel.id);

        // Get recent streams
        const { data: streams } = await supabase
          .from('streams')
          .select('*')
          .eq('channel_id', channel.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (streams) {
          setRecentStreams(streams);
          
          // Calculate stats
          const totalStreams = streams.length;
          const totalViews = streams.reduce((sum, stream) => sum + (stream.viewer_count || 0), 0);
          
          setStats({
            totalViews,
            totalStreams,
            avgViewTime: '23 min', // Mock data for now
            lastStream: streams.length > 0 ? 'Recently' : 'Never'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Navigation */}
      <nav className="backdrop-blur-sm bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Video className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">StreamAI</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {user.channelName}</span>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Channel Dashboard</h1>
            <p className="text-gray-300">Manage your streams and view analytics</p>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to={`/stream/${channelId}`}>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <Radio className="h-4 w-4 mr-2" />
                Go Live
              </Button>
            </Link>
            <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/20 border-purple-400/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalViews.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-purple-400/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Streams</CardTitle>
              <Video className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalStreams}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-purple-400/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Avg. View Time</CardTitle>
              <Clock className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.avgViewTime}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-purple-400/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Last Stream</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.lastStream}</div>
            </CardContent>
          </Card>
        </div>

        {/* Channel Status */}
        <Card className="bg-black/20 border-purple-400/20 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              Channel Status
              <Badge variant={user.isLive ? "destructive" : "secondary"} className={user.isLive ? "bg-red-600" : "bg-gray-600"}>
                {user.isLive ? "LIVE" : "OFFLINE"}
              </Badge>
            </CardTitle>
            <CardDescription className="text-gray-300">
              Your channel is currently {user.isLive ? "broadcasting live" : "offline"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                <span className="font-semibold">Channel URL:</span> streamai.app/watch/{channelId}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Streams */}
        <Card className="bg-black/20 border-purple-400/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Recent Streams</CardTitle>
            <CardDescription className="text-gray-300">
              Your latest streaming sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentStreams.length > 0 ? (
                recentStreams.map((stream) => (
                  <div
                    key={stream.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Video className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{stream.title}</h3>
                        <p className="text-gray-400 text-sm">
                          {new Date(stream.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{stream.viewer_count} views</p>
                      <p className="text-gray-400 text-sm">
                        {stream.ended_at ? 'Ended' : stream.is_live ? 'Live' : 'Offline'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No streams yet. Start your first stream!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
