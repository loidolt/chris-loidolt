import Link from 'next/link'
import { AlertCircle, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SetupPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Setup Required
          </CardTitle>
          <CardDescription>
            Configure your environment variables to start using the Digital Forest
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Missing Environment Variables</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The following required environment variables are not configured:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><code className="text-xs bg-muted px-1 py-0.5 rounded">GITHUB_TOKEN</code></li>
              <li><code className="text-xs bg-muted px-1 py-0.5 rounded">GITHUB_OWNER</code></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Setup Instructions</h3>
            <ol className="list-decimal list-inside space-y-3 text-sm">
              <li>
                Create a <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.local</code> file in your project root
              </li>
              <li>
                <span>Generate a GitHub personal access token at </span>
                <Link 
                  href="https://github.com/settings/tokens/new" 
                  target="_blank"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  GitHub Settings
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                Add the following to your <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.local</code> file:
                <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-x-auto">
{`GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_OWNER=yourusername

# Optional
SITE_URL=https://yourdomain.com
REVALIDATE_SECRET=your-secret-key
CACHE_TTL=3600000
CACHE_ENABLED=true`}
                </pre>
              </li>
              <li>Restart your development server</li>
            </ol>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Need help? Check out the setup guides in the project documentation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}