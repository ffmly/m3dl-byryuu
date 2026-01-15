import './style.css';
import { Scene3D } from './scene3d.js';
import { UI } from './ui.js';

/**
 * M3DL - Grade Calculator for Algerian Universities
 * Main entry point
 */

// Initialize 3D background scene
let scene3d = null;

// Initialize UI manager
let ui = null;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  init();
});

function init() {
  console.log('🚀 Initializing M3DL...');

  // Initialize 3D scene
  try {
    scene3d = new Scene3D();
    console.log('✓ 3D scene initialized');
  } catch (error) {
    console.error('Error initializing 3D scene:', error);
  }

  // Initialize UI
  try {
    ui = new UI();
    // Make UI available globally for inline event handlers
    window.ui = ui;
    console.log('✓ UI initialized');
  } catch (error) {
    console.error('Error initializing UI:', error);
  }

  console.log('✓ M3DL ready!');
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (scene3d) {
    scene3d.dispose();
  }
});

// Handle visibility change (pause animations when tab is hidden)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause animations if needed
    console.log('Tab hidden - pausing animations');
  } else {
    // Resume animations
    console.log('Tab visible - resuming animations');
  }
});
