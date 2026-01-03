/**
 * Format a Unix timestamp (in seconds) to a relative time string
 * @param seconds - Unix timestamp in seconds
 * @returns Formatted relative time string (e.g., "2 hours ago", "3 days ago")
 */
export default function formatTime(seconds: number): string {
    if (!seconds) return "";

    const postDate = new Date(seconds * 1000);
    const now = new Date();
    const diff = Math.floor((now.getTime() - postDate.getTime()) / 1000); // difference in seconds

    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

    // More than 1 week, show the date
    return postDate.toLocaleDateString();
}
