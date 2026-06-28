
type LinkResult = {
    links: string[];
    text: string;
};

export function isUrl(string:string){
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;  
    }
}

// get links from plain text
// returns list of links
export function extractLinks(message: string): LinkResult {
    const urlRegex = /((https?:\/\/|www\.)[^\s]+)/g;

    const links = message.match(urlRegex) || [];

    // Remove links from text
    const text = message.replace(urlRegex, "");

    return { links, text };
}

export const getExtension = (url?: string | null): string => {
  if (!url) return "";

  const last = url.split("?")[0].split("/").pop();
  if (!last || !last.includes(".")) return "";

  return last.split(".").pop()!.toLowerCase();
};