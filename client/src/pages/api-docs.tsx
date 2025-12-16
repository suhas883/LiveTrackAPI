import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Send, Clock, Package } from "lucide-react";

export default function ApiDocs() {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Code className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold" data-testid="text-api-title">API Documentation</h1>
            <p className="text-sm text-muted-foreground">Integrate package tracking into your applications</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Base URL */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Base URL</CardTitle>
            </CardHeader>
            <CardContent>
              <code className="block bg-muted p-3 rounded-md font-mono text-sm" data-testid="text-base-url">
                https://livetrackings.com/api
              </code>
            </CardContent>
          </Card>

          {/* Track Package Endpoint */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge className="bg-green-500 text-white">POST</Badge>
                <CardTitle className="text-lg font-mono">/track</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Submit a tracking number to get real-time package status and tracking history.
              </p>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Request Body
                </h4>
                <pre className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto" data-testid="code-track-request">
{`{
  "trackingNumber": "1Z999AA10123456784"
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Response
                </h4>
                <pre className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto" data-testid="code-track-response">
{`{
  "id": "uuid",
  "trackingNumber": "1Z999AA10123456784",
  "courier": "UPS",
  "courierCode": "ups",
  "status": "in_transit",
  "statusDescription": "Package in transit to destination",
  "origin": "Los Angeles, CA",
  "destination": "New York, NY",
  "estimatedDelivery": "Dec 10, 2024",
  "lastUpdate": "Dec 8, 2024 2:30 PM",
  "events": [
    {
      "date": "Dec 8, 2024",
      "time": "2:30 PM",
      "location": "Chicago, IL",
      "status": "In Transit",
      "description": "Package departed facility"
    }
  ],
  "createdAt": "2024-12-08T14:30:00Z",
  "updatedAt": "2024-12-08T14:30:00Z"
}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Get Tracking Endpoint */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-500 text-white">GET</Badge>
                <CardTitle className="text-lg font-mono">/track/:id</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Retrieve a previously tracked package by its record ID.
              </p>
              
              <div>
                <h4 className="font-medium mb-2">Parameters</h4>
                <div className="bg-muted p-4 rounded-md">
                  <code className="font-mono text-sm">id</code>
                  <span className="text-muted-foreground text-sm ml-2">- The tracking record UUID</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Endpoint */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-500 text-white">GET</Badge>
                <CardTitle className="text-lg font-mono">/history</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Get a list of recent tracking searches.
              </p>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Response
                </h4>
                <pre className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto" data-testid="code-history-response">
{`[
  {
    "id": "uuid",
    "trackingNumber": "1Z999AA10123456784",
    "courier": "UPS",
    "lastStatus": "in_transit",
    "searchedAt": "2024-12-08T14:30:00Z"
  }
]`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Status Codes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tracking Status Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200">pending</Badge>
                  <span className="text-sm text-muted-foreground">Package information received</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200">in_transit</Badge>
                  <span className="text-sm text-muted-foreground">Package is on the way</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200">out_for_delivery</Badge>
                  <span className="text-sm text-muted-foreground">Package out for delivery</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200">delivered</Badge>
                  <span className="text-sm text-muted-foreground">Package delivered successfully</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200">exception</Badge>
                  <span className="text-sm text-muted-foreground">Delivery exception or issue</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
