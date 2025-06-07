
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DevInfo = () => {
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const currentUrl = window.location.origin;
  
  if (!isDevelopment) return null;

  return (
    <Card className="fixed bottom-4 right-4 bg-blue-900/80 border-blue-400/20 backdrop-blur-sm z-50 max-w-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Badge variant="secondary">DEV</Badge>
          Development Info
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-1">
        <div className="text-blue-200">
          <strong>Current URL:</strong> {currentUrl}
        </div>
        <div className="text-blue-200">
          <strong>Example Watch Link:</strong>
        </div>
        <div className="text-blue-100 font-mono text-xs bg-blue-800/50 p-1 rounded break-all">
          {currentUrl}/watch/f4f46040-1170-4994-ad62-65069dafe841
        </div>
        <div className="text-blue-300 text-xs pt-1">
          ℹ️ This info only shows in development
        </div>
      </CardContent>
    </Card>
  );
};

export default DevInfo;
