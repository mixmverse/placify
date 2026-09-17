// src/lib/pitch-email.tsx
// React email template for pitch notifications sent to curators
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");

interface PitchEmailData {
  submissionId: string;
  curatorName: string;
  curatorEmail: string;
  artistName: string;
  trackTitle: string;
  spotifyTrackId: string;
  playlistName: string;
  message: string | null;
  isPaid: boolean;
  priceCents: number;
  paymentMethod: string | null;
  paymentInfo: string | null;
  pitchToken: string;
}

function PitchEmail({
  curatorName,
  artistName,
  trackTitle,
  spotifyTrackId,
  playlistName,
  message,
  isPaid,
  priceCents,
  paymentMethod,
  paymentInfo,
  pitchToken,
}: PitchEmailData) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const acceptUrl = `${siteUrl}/api/submissions/${pitchToken}/accept`;
  const rejectUrl = `${siteUrl}/api/submissions/${pitchToken}/reject`;
  const spotifyUrl = `https://open.spotify.com/track/${spotifyTrackId}`;
  const priceDisplay = isPaid ? `$${(priceCents / 100).toFixed(2)}` : "Free";

  const paymentMethodLabel: Record<string, string> = {
    paypal: "PayPal",
    stripe: "Stripe",
    cashapp: "Cash App",
    venmo: "Venmo",
    bank: "Bank Transfer",
    other: "Other",
  };

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: 600, margin: "0 auto", padding: "32px 24px", backgroundColor: "#fafafa" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#111" }}>🎵 New Pitch</div>
        <div style={{ fontSize: 14, color: "#666", marginTop: 8 }}>
          {artistName} wants to pitch &quot;{trackTitle}&quot; to your playlist
        </div>
      </div>

      {/* Card */}
      <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid #e5e5e5", padding: 28, marginBottom: 24 }}>
        {/* Curator greeting */}
        <div style={{ fontSize: 16, fontWeight: 600, color: "#111", marginBottom: 16 }}>
          Hi {curatorName},
        </div>

        {/* Artist message */}
        <div style={{ fontSize: 15, color: "#333", lineHeight: 1.6, marginBottom: 20 }}>
          {message || `${artistName} submitted their track "${trackTitle}" for consideration on your playlist "${playlistName}". Take a listen and let them know what you think!`}
        </div>

        {/* Track details */}
        <div style={{ backgroundColor: "#f5f5f5", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#666", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Track Details</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 4 }}>{trackTitle}</div>
          <div style={{ fontSize: 14, color: "#555", marginBottom: 4 }}>by {artistName}</div>
          <div style={{ fontSize: 13, color: "#666" }}>
            Playlist: <strong>{playlistName}</strong>
          </div>
        </div>

        {/* Spotify link */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              backgroundColor: "#1DB954",
              color: "#fff",
              padding: "12px 28px",
              borderRadius: 9999,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            🎧 Listen on Spotify
          </a>
        </div>

        {/* Payment info for paid curators */}
        {isPaid && paymentMethod && paymentInfo && (
          <div style={{ backgroundColor: "#FFF7ED", borderRadius: 12, padding: 16, marginBottom: 20, border: "1px solid #FED7AA" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#92400E", marginBottom: 8 }}>
              💰 Payment Required — {priceDisplay}
            </div>
            <div style={{ fontSize: 14, color: "#78350F" }}>
              Pay via <strong>{paymentMethodLabel[paymentMethod] || paymentMethod}</strong>: {paymentInfo}
            </div>
            <div style={{ fontSize: 13, color: "#92400E", marginTop: 6 }}>
              The artist will confirm once they&apos;ve sent payment.
            </div>
          </div>
        )}

        {/* Accept / Reject buttons */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <a
            href={acceptUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              backgroundColor: "#111",
              color: "#fff",
              padding: "14px 32px",
              borderRadius: 9999,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 15,
              marginRight: 12,
            }}
          >
            ✓ Accept Pitch
          </a>
          <a
            href={rejectUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              backgroundColor: "#fff",
              color: "#666",
              padding: "14px 32px",
              borderRadius: 9999,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 15,
              border: "1px solid #ddd",
            }}
          >
            ✗ Decline
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", fontSize: 12, color: "#999", lineHeight: 1.6 }}>
        <div>This pitch expires in 7 days if no action is taken.</div>
        <div style={{ marginTop: 8 }}>
          Powered by <a href={siteUrl} style={{ color: "#999" }}>Placify</a> — connecting artists with playlist curators
        </div>
      </div>
    </div>
  );
}

export async function sendPitchEmail(data: PitchEmailData) {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await resend.emails.send({
      from: "Placify <noreply@placify.com>",
      to: data.curatorEmail,
      subject: `🎵 New pitch from ${data.artistName} — "${data.trackTitle}"`,
      react: PitchEmail(data),
    });
  } catch (e) {
    console.error("Failed to send pitch email:", e);
  }
}
