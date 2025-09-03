import { NextRequest, NextResponse } from "next/server"

interface Lead {
  id: string
  email: string
  firstName: string
  lastName: string
  company?: string | null
  jobTitle?: string | null
  teamSize?: string | null
  source: string
  consentMarketing: boolean
  createdAt: string
}

// Mock database for demo purposes
const leads: Lead[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.email || !body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingLead = leads.find(lead => lead.email === body.email)
    if (existingLead) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    // Create new lead
    const newLead = {
      id: crypto.randomUUID(),
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      company: body.company || null,
      jobTitle: body.jobTitle || null,
      teamSize: body.teamSize || null,
      source: "podcast-landing",
      consentMarketing: body.consentMarketing || false,
      createdAt: new Date().toISOString(),
    }

    // In production, save to Supabase
    leads.push(newLead)

    // Return success response
    return NextResponse.json({
      id: newLead.id,
      email: newLead.email,
      createdAt: newLead.createdAt,
      assessmentUrl: `/assessment/${newLead.id}`,
    })
  } catch (error) {
    console.error("Error creating lead:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Admin endpoint to list leads (protected in production)
export async function GET() {
  try {
    // In production, verify admin authentication
    return NextResponse.json({
      leads: leads,
      total: leads.length,
    })
  } catch (error) {
    console.error("Error fetching leads:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}