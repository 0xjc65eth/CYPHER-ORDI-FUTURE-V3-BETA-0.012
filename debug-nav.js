// Execute este script no Console do Chrome em http://localhost:4444
// Para diagnosticar problemas de navegação

console.log('🔧 CYPHER Navigation Debug Tool');
console.log('================================');

// 1. Verificar se os elementos de navegação existem
const nav = document.querySelector('nav');
const navLinks = document.querySelectorAll('nav a');

console.log('📊 Navigation Elements:');
console.log('Nav element found:', nav ? 'YES' : 'NO');
console.log('Navigation links found:', navLinks.length);

if (!nav) {
    console.log('❌ ERROR: Navigation element not found!');
} else {
    // 2. Verificar posicionamento e visibilidade
    const navRect = nav.getBoundingClientRect();
    console.log('📐 Navigation Position:');
    console.log('Position:', navRect.left, navRect.top);
    console.log('Size:', navRect.width + 'x' + navRect.height);
    console.log('Z-index:', getComputedStyle(nav).zIndex);
    console.log('Position:', getComputedStyle(nav).position);
    console.log('Pointer events:', getComputedStyle(nav).pointerEvents);
    
    // 3. Analisar cada link de navegação
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
    });
    
    // 4. Verificar sobreposição de elementos
    console.log('🎯 Overlap Detection:');
    if (navLinks.length > 0) {
        const firstLink = navLinks[0];
        const rect = firstLink.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const elementsAtPoint = document.elementsFromPoint(centerX, centerY);
        console.log('Elements at first link center:', elementsAtPoint.map(el => `${el.tagName}.${el.className.split(' ')[0] || 'no-class'}`));
        
        // Verificar se o primeiro link é o elemento superior
        const isTopmost = elementsAtPoint[0] === firstLink;
        console.log('First link is topmost element:', isTopmost ? 'YES' : 'NO');
        
        if (!isTopmost) {
            console.log('⚠️ WARNING: Navigation link is being covered by another element!');
            console.log('Covering element:', elementsAtPoint[0]);
        }
    }
    
    // 5. Testar eventos de clique
    console.log('🧪 Testing click events on first 3 links:');
    for (let i = 0; i < Math.min(3, navLinks.length); i++) {
        const link = navLinks[i];
        const text = link.textContent?.trim();
        
        // Adicionar listener temporário
        link.addEventListener('click', function(e) {
            console.log(`✅ Click event fired on: ${text}`);
            console.log('Event details:', e);
            e.preventDefault(); // Impedir navegação para teste
        }, { once: true });
        
        console.log(`Added test click listener to: ${text}`);
    }
    
    console.log('✅ Diagnostic complete! Try clicking the navigation links now.');
}