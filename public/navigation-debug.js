// Advanced Navigation Debugging Script
// Execute this in browser console on http://localhost:4444

function debugNavigation() {
    console.log('🔧 CYPHER Navigation Debug Tool');
    console.log('================================');
    
    // 1. Check if navigation elements exist
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('nav a');
    
    console.log('📊 Navigation Elements:');
    console.log(`Nav element found: ${nav ? 'YES' : 'NO'}`);
    console.log(`Navigation links found: ${navLinks.length}`);
    
    if (!nav) {
        console.log('❌ ERROR: Navigation element not found!');
        return;
    }
    
    // 2. Check navigation positioning and visibility
    const navRect = nav.getBoundingClientRect();
    console.log('📐 Navigation Position:');
    console.log(`Position: ${navRect.left}, ${navRect.top}`);
    console.log(`Size: ${navRect.width}x${navRect.height}`);
    console.log(`Z-index: ${getComputedStyle(nav).zIndex}`);
    console.log(`Position: ${getComputedStyle(nav).position}`);
    console.log(`Pointer events: ${getComputedStyle(nav).pointerEvents}`);
    
    // 3. Check each navigation link
    console.log('🔗 Navigation Links Analysis:');
    navLinks.forEach((link, index) => {
        const rect = link.getBoundingClientRect();
        const href = link.getAttribute('href');
        const text = link.textContent?.trim();
        
        console.log(`Link ${index + 1}: "${text}" -> ${href}`);
        console.log(`  Visible: ${rect.width > 0 && rect.height > 0}`);
        console.log(`  Position: ${Math.round(rect.left)}, ${Math.round(rect.top)}`);
        console.log(`  Size: ${Math.round(rect.width)}x${Math.round(rect.height)}`);
        console.log(`  Z-index: ${getComputedStyle(link).zIndex}`);
        console.log(`  Pointer events: ${getComputedStyle(link).pointerEvents}`);
        
        // Test click detection
        const testClick = (e) => {
            console.log(`✅ Click detected on "${text}"!`);
            e.preventDefault(); // Prevent navigation for testing
        };
        
        link.addEventListener('click', testClick, { once: true });
    });
    
    // 4. Check for overlapping elements
    console.log('🎯 Overlap Detection:');
    if (navLinks.length > 0) {
        const firstLink = navLinks[0];
        const rect = firstLink.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const elementsAtPoint = document.elementsFromPoint(centerX, centerY);
        console.log('Elements at first link center:', elementsAtPoint.map(el => `${el.tagName}.${el.className.split(' ')[0] || 'no-class'}`));
        
        // Check if first link is the topmost element
        const isTopmost = elementsAtPoint[0] === firstLink;
        console.log(`First link is topmost element: ${isTopmost ? 'YES' : 'NO'}`);
        
        if (!isTopmost) {
            console.log('⚠️ WARNING: Navigation link is being covered by another element!');
            console.log('Covering element:', elementsAtPoint[0]);
        }
    }
    
    // 5. Test Next.js Link functionality
    console.log('⚛️ Next.js Link Check:');
    try {
        // Check if Next.js router is available
        if (window.next && window.next.router) {
            console.log('✅ Next.js router available');
            console.log('Current route:', window.next.router.route);
        } else {
            console.log('⚠️ Next.js router not detected');
        }
    } catch (e) {
        console.log('❌ Error checking Next.js router:', e.message);
    }
    
    return {
        nav,
        navLinks,
        testAllLinks: () => {
            console.log('🧪 Testing all navigation links...');
            navLinks.forEach((link, index) => {
                setTimeout(() => {
                    console.log(`Testing link ${index + 1}...`);
                    link.click();
                }, index * 1000);
            });
        }
    };
}

// Auto-run when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(debugNavigation, 1000);
    });
} else {
    setTimeout(debugNavigation, 1000);
}

// Make available globally
window.debugNavigation = debugNavigation;