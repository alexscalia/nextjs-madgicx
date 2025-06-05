"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Building2, Users2 } from "lucide-react"
import Link from "next/link"

export default function SignInSelector() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-bold text-gray-900">
            Choose Your Portal
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Select the appropriate login portal for your account type
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Staff Portal */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Staff Portal</CardTitle>
              <CardDescription>
                For administrators and support team members
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                <div className="text-sm text-gray-600">
                  <strong>Access to:</strong>
                  <ul className="mt-1 list-disc list-inside space-y-1 text-xs">
                    <li>Admin dashboard</li>
                    <li>Customer management</li>
                    <li>System configuration</li>
                    <li>Support tools</li>
                  </ul>
                </div>
              </div>
              <Link href="/auth/staff/signin">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Staff Login
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Customer Portal */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Customer Portal</CardTitle>
              <CardDescription>
                For main business accounts and agencies
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                <div className="text-sm text-gray-600">
                  <strong>Access to:</strong>
                  <ul className="mt-1 list-disc list-inside space-y-1 text-xs">
                    <li>Campaign management</li>
                    <li>Analytics dashboard</li>
                    <li>Sub-customer management</li>
                    <li>Account settings</li>
                  </ul>
                </div>
              </div>
              <Link href="/auth/customer/signin">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Customer Login
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Sub-Customer Portal */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto h-16 w-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                <Users2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Sub-Customer Portal</CardTitle>
              <CardDescription>
                For sub-accounts and limited access users
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                <div className="text-sm text-gray-600">
                  <strong>Access to:</strong>
                  <ul className="mt-1 list-disc list-inside space-y-1 text-xs">
                    <li>Assigned campaigns</li>
                    <li>Limited analytics</li>
                    <li>Scoped dashboard</li>
                    <li>Sub-account tools</li>
                  </ul>
                </div>
              </div>
              <Link href="/auth/subcustomer/signin">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Sub-Customer Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center pt-6">
          <p className="text-sm text-gray-500">
            Not sure which portal to use? Contact our{" "}
            <Link href="/auth/staff/signin" className="text-blue-600 hover:text-blue-500">
              support team
            </Link>{" "}
            for assistance.
          </p>
        </div>
      </div>
    </div>
  )
} 