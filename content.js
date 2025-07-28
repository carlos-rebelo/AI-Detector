function getVisibleText() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  let visibleText = '';

  while ((node = walker.nextNode())) {
    const parent = node.parentNode;
    const style = window.getComputedStyle(parent);

    const isVisible =
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      node.textContent.trim().length > 20;

    const isBadTag = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'NAV', 'FOOTER', 'HEADER', 'ASIDE'].includes(parent.tagName);

    if (isVisible && !isBadTag) {
      visibleText += node.textContent.replace(/\s+/g, ' ').trim() + ' ';
    }
  }

  return visibleText.trim();
}


// Move listener OUTSIDE so it stays registered
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getText") {
    const text = getVisibleText();
    sendResponse({ text: text });
  }
});
console.log("AI Detector content script loaded.");