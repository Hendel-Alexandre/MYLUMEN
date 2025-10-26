import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-calendar',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Calendar not connected');
  }
  return accessToken;
}

export async function getUncachableGoogleCalendarClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  location?: string;
}

export async function listGoogleCalendarEvents(
  calendarId: string = 'primary',
  timeMin?: Date,
  timeMax?: Date,
  maxResults: number = 250
) {
  try {
    const calendar = await getUncachableGoogleCalendarClient();
    
    const response = await calendar.events.list({
      calendarId,
      timeMin: timeMin?.toISOString(),
      timeMax: timeMax?.toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  } catch (error) {
    console.error('Error listing Google Calendar events:', error);
    throw error;
  }
}

export async function createGoogleCalendarEvent(
  event: GoogleCalendarEvent,
  calendarId: string = 'primary'
) {
  try {
    const calendar = await getUncachableGoogleCalendarClient();
    
    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });

    return response.data;
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    throw error;
  }
}

export async function updateGoogleCalendarEvent(
  eventId: string,
  event: GoogleCalendarEvent,
  calendarId: string = 'primary'
) {
  try {
    const calendar = await getUncachableGoogleCalendarClient();
    
    const response = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: event,
    });

    return response.data;
  } catch (error) {
    console.error('Error updating Google Calendar event:', error);
    throw error;
  }
}

export async function deleteGoogleCalendarEvent(
  eventId: string,
  calendarId: string = 'primary'
) {
  try {
    const calendar = await getUncachableGoogleCalendarClient();
    
    await calendar.events.delete({
      calendarId,
      eventId,
    });

    return true;
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
    throw error;
  }
}

export function bookingToGoogleEvent(
  booking: any, 
  clientEmail?: string, 
  timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
): GoogleCalendarEvent {
  const [year, month, day] = booking.date.split('-').map(Number);
  const [hours, minutes] = booking.time.split(':').map(Number);
  
  const startTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + booking.duration);

  const formatDateTime = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const event: GoogleCalendarEvent = {
    summary: booking.title,
    description: booking.notes || '',
    start: {
      dateTime: formatDateTime(startTime),
      timeZone: timeZone,
    },
    end: {
      dateTime: formatDateTime(endTime),
      timeZone: timeZone,
    },
  };

  if (clientEmail) {
    event.attendees = [{ email: clientEmail }];
  }

  return event;
}
