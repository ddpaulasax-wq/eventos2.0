const url = "https://mttjfyeclgzavxufaeue.supabase.co/rest/v1/calendar_events";
const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dGpmeWVjbGd6YXZ4dWZhZXVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMDM1MTQsImV4cCI6MjA4OTg3OTUxNH0.mpMACUt0SkHk0jQo2XnUwb113Nf1BkSSpNaxZiLtilw";

async function testFetch() {
  const response = await fetch(`${url}?limit=1`, {
    method: "GET",
    headers: {
      "apikey": apikey,
      "Authorization": `Bearer ${apikey}`
    }
  });
  
  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Response:", text);
}

testFetch();
