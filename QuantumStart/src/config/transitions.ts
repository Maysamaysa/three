/**
 * GLOBAL TRANSITION CONFIGURATION
 * 
 * Adjust these values to fine-tune the "fade and slide" animations 
 * across the entire application.
 */

export const TRANSITION_CONFIG = {
  // Main page transition (Slide Up)
  page: {
    duration: 0.7,
    ease: [0.4, 0, 0.2, 1], // standard ease-in-out
    yOffset: 30, // How many pixels to slide up
  },
  
  // Header / Top Nav transition (Slide Down)
  header: {
    duration: 0.8,
    delay: 0.2, // Increased delay to ensure page slide starts first
    ease: [0.4, 0, 0.2, 1],
    yOffset: -20, // Slide down from top
  }
}
