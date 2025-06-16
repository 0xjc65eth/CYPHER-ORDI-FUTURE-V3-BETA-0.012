// Console Navigation Test Script
// Paste this into browser console on http://localhost:4444

function testNavigationClicks() {
    console.log('🧪 Starting navigation click tests...');
    
    // Find all navigation links
    const navLinks = document.querySelectorAll('nav a');
    console.log(`🔍 Found ${navLinks.length} navigation links`);
    
    navLinks.forEach((link, index) => {
        const rect = link.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        const href = link.getAttribute('href');
        const text = link.textContent?.trim();
        
        console.log(`Link ${index}: "${text}" -> ${href} (Visible: ${isVisible})`);
        
        if (isVisible) {
            console.log(`  Position: ${Math.round(rect.left)}, ${Math.round(rect.top)} | Size: ${Math.round(rect.width)}x${Math.round(rect.height)}`);
            console.log(`  Z-index: ${getComputedStyle(link).zIndex}`);
            console.log(`  Pointer-events: ${getComputedStyle(link).pointerEvents}`);
        }
    });
    
    return navLinks;
}

function simulateClick(linkIndex = 0) {
    const navLinks = document.querySelectorAll('nav a');
    if (navLinks[linkIndex]) {
        const link = navLinks[linkIndex];
        console.log(`🖱️ Simulating click on: "${link.textContent?.trim()}" -> ${link.href}`);
        
        // Try multiple click methods
        try {
            // Method 1: Regular click
            link.click();
            console.log('✅ Regular click() executed');
        } catch (e) {
            console.log('❌ Regular click() failed:', e.message);
        }
        
        try {
            // Method 2: Dispatch click event
            const event = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            link.dispatchEvent(event);
            console.log('✅ Dispatched click event');
        } catch (e) {
            console.log('❌ Dispatch click event failed:', e.message);
        }
        
        // Method 3: Direct navigation
        setTimeout(() => {
            if (window.location.pathname === link.getAttribute('href')) {
                console.log('✅ Navigation successful!');
            } else {
                console.log('⚠️ Navigation may have failed, trying direct navigation...');
                window.location.href = link.href;
            }
        }, 500);
        
    } else {
        console.log(`❌ No link found at index ${linkIndex}`);
    }
}

function diagnoseNavigationIssues() {
    console.log('🔧 Diagnosing navigation issues...');
    
    // Check for JavaScript errors
    window.addEventListener('error', (e) => {
        console.log('❌ JavaScript Error:', e.message, 'at', e.filename, ':', e.lineno);
    });
    
    // Check for overlapping elements
    const nav = document.querySelector('nav');
    if (nav) {
        const navRect = nav.getBoundingClientRect();
        console.log(`📐 Navigation position: ${Math.round(navRect.left)}, ${Math.round(navRect.top)}`);
        console.log(`📐 Navigation size: ${Math.round(navRect.width)}x${Math.round(navRect.height)}`);
        console.log(`🎨 Navigation z-index: ${getComputedStyle(nav).zIndex}`);
        
        // Check for elements that might be covering the navigation
        const elementsAtNavPos = document.elementsFromPoint(navRect.left + navRect.width/2, navRect.top + navRect.height/2);
        console.log('🎯 Elements at navigation center:', elementsAtNavPos.map(el => el.tagName + (el.className ? '.' + el.className.split(' ')[0] : '')));
    }
    
    // Check Next.js router
    if (window.next && window.next.router) {
        console.log('✅ Next.js router available');
    } else {
        console.log('⚠️ Next.js router not detected');
    }
    
    return {
        testClicks: testNavigationClicks,
        simulateClick: simulateClick,
        clickFirst: () => simulateClick(0),
        clickSecond: () => simulateClick(1),
        clickThird: () => simulateClick(2)
    };
}

// Auto-run diagnostics
console.log('🚀 Navigation test script loaded!');
console.log('📝 Available commands:');
console.log('  testNavigationClicks() - Analyze all nav links');
console.log('  simulateClick(index) - Click specific link');
console.log('  diagnoseNavigationIssues() - Full diagnosis');

// Run initial test
const nav = diagnoseNavigationIssues();
nav.testClicks();