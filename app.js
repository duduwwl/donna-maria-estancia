(() => {
  const catalog = window.DonnaCatalog;
  let products = catalog.load();
  let category = 'Todos';
  let query = '';
  let sort = 'featured';
  let quickProduct = null;
  let quickImageIndex = 0;
  let selectedSize = '';
  let selectedColor = '';
  let cart = readStore('donna-cart', []);
  let favorites = readStore('donna-favorites', []);
  let shippingAddress = null;
  let lastFocus = null;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
  const text = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  const imageUrl = value => /^data:image\//i.test(String(value || '')) ? value : `assets/${encodeURIComponent(String(value || ''))}`;
  const unique = values => [...new Set(values.filter(Boolean))];

  function readStore(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }
  function persist() {
    try {
      localStorage.setItem('donna-cart', JSON.stringify(cart));
      localStorage.setItem('donna-favorites', JSON.stringify(favorites));
    } catch { /* Browsing can continue when storage is unavailable. */ }
  }
  function toast(message) {
    const element = $('#toast');
    if (!element) return;
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => element.classList.remove('show'), 2400);
  }
  function photos(product) {
    const gallery = Array.isArray(product.images) && product.images.length ? product.images : [product.image, product.image2].filter(Boolean);
    return unique(gallery.map(imageUrl));
  }
  function cardMarkup(product, index = 0) {
    const imageList = photos(product);
    const favorite = favorites.includes(product.id);
    const unavailable = product.available === false || (Number.isFinite(Number(product.stock)) && Number(product.stock) <= 0);
    return `<article class="product-card${unavailable ? ' is-unavailable' : ''}" style="--card-index:${Math.min(index, 12)}" data-product="${text(product.id)}">
      <div class="product-media">
        <img class="product-photo" loading="lazy" decoding="async" src="${imageList[0] || ''}" alt="${text(product.name)}${text(product.category ? ` · ${product.category}` : '')}" width="517" height="777">
        ${imageList[1] ? `<img class="product-photo product-photo-secondary" loading="lazy" decoding="async" src="${imageList[1]}" alt="Outra vista de ${text(product.name)}" width="517" height="777">` : ''}
        ${product.tag ? `<span class="product-label">${text(product.tag)}</span>` : ''}
        ${unavailable ? '<span class="product-unavailable">Consulte disponibilidade</span>' : ''}
        <button class="product-heart ${favorite ? 'is-favorite' : ''}" data-favorite="${text(product.id)}" aria-label="${favorite ? 'Remover dos' : 'Adicionar aos'} favoritos" aria-pressed="${favorite}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.9c0 5.3-8.8 11-8.8 11s-8.8-5.7-8.8-11A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.8 2.3Z"/></svg></button>
        <button class="quick-add" data-detail="${text(product.id)}">Ver peça <span aria-hidden="true">↗</span></button>
      </div>
      <div class="product-info"><div class="product-category">${text(product.category || '')}</div><h3 class="product-title">${text(product.name)}</h3><div class="product-price">${money(product.price)} ${product.oldPrice ? `<del>${money(product.oldPrice)}</del>` : product.old ? `<del>${money(product.old)}</del>` : ''}</div><div class="product-installments">Valor demonstrativo · confirme pelo WhatsApp</div></div>
    </article>`;
  }
  function renderTabs() {
    const target = $('#categoryTabs');
    if (!target) return;
    const categories = unique(products.map(item => item.category));
    const tabs = [['Todos', `Tudo <span>${products.length}</span>`], ...categories.map(item => [item, text(item)]), ['Favoritos', `♡ Favoritos <span>${favorites.length}</span>`]];
    target.innerHTML = tabs.map(([key, label]) => `<button class="category-tab ${category === key ? 'active' : ''}" data-category="${text(key)}" aria-pressed="${category === key}">${label}</button>`).join('');
    if ($('#favoriteCount')) $('#favoriteCount').textContent = favorites.length;
    $('#favoritesShortcut')?.setAttribute('aria-label', `Ver favoritos, ${favorites.length} ${favorites.length === 1 ? 'peça' : 'peças'}`);
  }
  function renderProducts() {
    const grid = $('#productGrid');
    if (!grid) return;
    renderTabs();
    const size = $('#filterSize')?.value || '';
    const color = $('#filterColor')?.value || '';
    const price = $('#filterPrice')?.value || '';
    const newOnly = $('#filterNew')?.checked || false;
    let items = products.filter(product => {
      const haystack = normalize([product.name, product.category, product.description, product.sku, ...(product.colors || [])].join(' '));
      return (category === 'Todos' || (category === 'Favoritos' ? favorites.includes(product.id) : product.category === category))
        && (!query || haystack.includes(normalize(query)))
        && (!size || (product.sizes || []).includes(size))
        && (!color || (product.colors || []).some(item => normalize(item) === normalize(color)))
        && (!price || (price === 'under150' ? Number(product.price) < 150 : price === '150to200' ? Number(product.price) >= 150 && Number(product.price) <= 200 : Number(product.price) > 200))
        && (!newOnly || product.new === true);
    });
    if (sort === 'price-asc') items.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') items.sort((a, b) => b.price - a.price);
    if (sort === 'name') items.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    grid.innerHTML = items.length ? items.map(cardMarkup).join('') : `<div class="no-results"><span class="empty-mark" aria-hidden="true">${category === 'Favoritos' ? '♡' : '⌕'}</span><b>${category === 'Favoritos' && !favorites.length ? 'Seu coração ainda está livre.' : 'Não encontramos essa peça.'}</b><span>${category === 'Favoritos' && !favorites.length ? 'Guarde aqui os looks que chamaram sua atenção.' : 'Experimente outro termo ou limpe os filtros.'}</span><button type="button" class="text-link" data-clear-filters>Ver toda a coleção ↗</button></div>`;
    renderDiscovery();
    renderActiveFilters();
  }
  function renderDiscovery() {
    const newest = $('#newArrivalsGrid');
    const featured = $('#featuredGrid');
    const newProducts = products.filter(product => product.new === true).slice(0, 8);
    const featuredProducts = products.filter(product => product.featured === true).slice(0, 8);
    if (newest) { newest.innerHTML = newProducts.map(cardMarkup).join(''); newest.closest('.discovery-section').hidden = !newProducts.length; }
    if (featured) { featured.innerHTML = featuredProducts.map(cardMarkup).join(''); featured.closest('.discovery-section').hidden = !featuredProducts.length; }
  }
  function renderActiveFilters() {
    const target = $('#activeFilters');
    if (!target) return;
    const active = [query && `Busca: ${query}`, category !== 'Todos' && category, $('#filterSize')?.value && `Tamanho: ${$('#filterSize').value}`, $('#filterColor')?.value && `Cor: ${$('#filterColor').value}`, $('#filterPrice')?.value && 'Faixa de preço', $('#filterNew')?.checked && 'Novidades'].filter(Boolean);
    target.innerHTML = active.map(item => `<span class="active-filter">${text(item)}</span>`).join('');
  }
  function updateFilterOptions() {
    const sizeSelect = $('#filterSize');
    const colorSelect = $('#filterColor');
    if (!sizeSelect || !colorSelect) return;
    const keepSize = sizeSelect.value;
    const keepColor = colorSelect.value;
    sizeSelect.innerHTML = '<option value="">Todos os tamanhos</option>' + unique(products.flatMap(product => product.sizes || [])).map(item => `<option>${text(item)}</option>`).join('');
    colorSelect.innerHTML = '<option value="">Todas as cores</option>' + unique(products.flatMap(product => product.colors || [])).map(item => `<option>${text(item)}</option>`).join('');
    sizeSelect.value = keepSize;
    colorSelect.value = keepColor;
  }
  function setCategory(next) { category = next; renderProducts(); }
  function toggleFavorite(id) {
    favorites = favorites.includes(id) ? favorites.filter(value => value !== id) : [...favorites, id];
    persist();
    renderProducts();
    toast(favorites.includes(id) ? 'Peça guardada nos favoritos' : 'Peça removida dos favoritos');
  }

  const overlay = $('#overlay');
  const cartDrawer = $('#cartDrawer');
  const checkoutModal = $('#checkoutModal');
  const productModal = $('#productModal');
  const sizeGuide = $('#sizeGuideModal');
  const panels = [cartDrawer, checkoutModal, productModal, sizeGuide].filter(Boolean);
  function openPanel(panel) {
    if (!panel) return;
    lastFocus = document.activeElement;
    overlay?.classList.add('visible');
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('[autofocus],button:not([disabled]),a[href],input,select', panel)?.focus(), 30);
  }
  function closePanel(panel) {
    if (!panel) return;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    if (!panels.some(item => item.classList.contains('open'))) {
      overlay?.classList.remove('visible');
      document.body.style.overflow = '';
      lastFocus?.focus?.();
    }
  }
  function closeAll() { panels.forEach(closePanel); }

  function showProduct(id) {
    quickProduct = products.find(item => item.id === id);
    if (!quickProduct) return;
    quickImageIndex = 0;
    selectedSize = '';
    selectedColor = '';
    const images = photos(quickProduct);
    const image = $('#detailImage');
    image.src = images[0] || '';
    image.alt = quickProduct.name;
    $('#detailCategory').textContent = quickProduct.category || '';
    $('#detailName').textContent = quickProduct.name;
    $('#detailPrice').textContent = money(quickProduct.price);
    $('#detailDescription').textContent = quickProduct.description || 'Consulte os detalhes desta peça com a Donna Maria pelo WhatsApp.';
    $('#detailGallery').innerHTML = images.length > 1 ? `<button type="button" data-gallery="-1" aria-label="Foto anterior">‹</button><span>${images.map((url, index) => `<button type="button" class="gallery-dot ${index === 0 ? 'active' : ''}" data-gallery-index="${index}" aria-label="Foto ${index + 1}"></button>`).join('')}</span><button type="button" data-gallery="1" aria-label="Próxima foto">›</button>` : '';
    const confirmedSizes = quickProduct.sizes || [];
    const inquirySizes = confirmedSizes.length ? confirmedSizes : (window.DonnaSizeGuide?.sizes || []);
    $('#sizeOptions').innerHTML = inquirySizes.map(value => `<button type="button" class="size-option" data-size="${text(value)}" aria-pressed="false">${text(value)}</button>`).join('') || '<span class="variant-confirmation">Pergunte à loja quais tamanhos estão disponíveis.</span>';
    $('#sizeField').querySelector('.size-label').textContent = confirmedSizes.length ? 'Selecione o tamanho disponível' : 'Qual tamanho você procura?';
    $('#sizeField').querySelector('.variant-confirmation')?.remove();
    if (!confirmedSizes.length) $('#sizeOptions').insertAdjacentHTML('afterend', '<small class="variant-confirmation">Selecione o tamanho que procura. A loja confirma a grade e o estoque pelo WhatsApp.</small>');
    $('#colorOptions').innerHTML = (quickProduct.colors || []).map(value => `<button type="button" class="color-option" data-color="${text(value)}" aria-pressed="false">${text(value)}</button>`).join('') || '<span class="variant-confirmation">Cores disponíveis: confirme com a loja.</span>';
    $('#sizeField').hidden = !inquirySizes.length;
    $('#colorField').hidden = !(quickProduct.colors || []).length;
    $('#detailSizeGuide').hidden = !inquirySizes.length;
    $('#detailAdd').disabled = quickProduct.available === false || (Number.isFinite(Number(quickProduct.stock)) && Number(quickProduct.stock) <= 0);
    $('#detailAdd').textContent = $('#detailAdd').disabled ? 'Consulte disponibilidade' : 'Adicionar à sacola  ＋';
    $('#detailShare').dataset.share = id;
    openPanel(productModal);
  }
  function moveGallery(direction) {
    if (!quickProduct) return;
    const images = photos(quickProduct);
    if (images.length < 2) return;
    quickImageIndex = (quickImageIndex + direction + images.length) % images.length;
    const image = $('#detailImage');
    image.classList.add('is-changing');
    setTimeout(() => { image.src = images[quickImageIndex]; image.classList.remove('is-changing'); }, 130);
    $$('.gallery-dot').forEach((dot, index) => dot.classList.toggle('active', index === quickImageIndex));
  }
  function addToCart() {
    if (!quickProduct) return;
    if ((quickProduct.sizes || []).length && !selectedSize) { toast('Escolha um tamanho para continuar'); $('#sizeOptions').focus(); return; }
    if ((quickProduct.colors || []).length && !selectedColor) { toast('Escolha uma cor para continuar'); $('#colorOptions').focus(); return; }
    const count = cart.filter(item => item.id === quickProduct.id).reduce((sum, item) => sum + item.qty, 0);
    if (Number.isFinite(Number(quickProduct.stock)) && count >= Number(quickProduct.stock)) { toast('Estoque indisponível para esta peça'); return; }
    const size = selectedSize || 'A confirmar';
    const color = selectedColor || '';
    const existing = cart.find(item => item.id === quickProduct.id && item.size === size && (item.color || '') === color);
    if (existing) existing.qty += 1; else cart.push({ id: quickProduct.id, size, color, qty: 1 });
    persist();
    renderCart();
    closePanel(productModal);
    toast('✓ Adicionado à sacola');
    $('#cartCount')?.classList.add('count-pop');
    setTimeout(() => $('#cartCount')?.classList.remove('count-pop'), 450);
  }
  function cartCount() { return cart.reduce((sum, item) => sum + Number(item.qty || 0), 0); }
  function cartTotal() { return cart.reduce((sum, item) => sum + (Number(products.find(product => product.id === item.id)?.price) || 0) * Number(item.qty || 0), 0); }
  function renderCart() {
    const count = cartCount();
    if ($('#cartCount')) { $('#cartCount').textContent = count; $('#cartOpen')?.setAttribute('aria-label', `Abrir sacola, ${count} ${count === 1 ? 'item' : 'itens'}`); }
    if ($('#drawerCount')) $('#drawerCount').textContent = `(${count})`;
    $('#cartEmpty')?.classList.toggle('hidden', count > 0);
    $('#cartBottom')?.classList.toggle('hidden', count < 1);
    const target = $('#cartItems');
    if (target) target.innerHTML = cart.map(item => {
      const product = products.find(value => value.id === item.id);
      if (!product) return '';
      const key = `${encodeURIComponent(item.id)}|${encodeURIComponent(item.size)}|${encodeURIComponent(item.color || '')}`;
      return `<article class="cart-item"><img loading="lazy" src="${photos(product)[0] || ''}" alt="${text(product.name)}" width="72" height="96"><div class="cart-item-copy"><h4>${text(product.name)}</h4><small>${text(item.size && item.size !== 'A confirmar' ? `Tamanho ${item.size}` : 'Tamanho a confirmar')}${item.color ? ` · ${text(item.color)}` : ''}</small><div class="quantity-control"><button type="button" data-qty="${key}|-1" aria-label="Diminuir quantidade de ${text(product.name)}">−</button><span>${item.qty}</span><button type="button" data-qty="${key}|1" aria-label="Aumentar quantidade de ${text(product.name)}">+</button><button type="button" class="remove-item" data-remove="${key}">Remover</button></div></div><span class="cart-item-price">${money(product.price * item.qty)}</span></article>`;
    }).join('');
    if ($('#cartSubtotal')) $('#cartSubtotal').textContent = money(cartTotal());
  }
  function setQuantity(id, size, color, amount) {
    const item = cart.find(value => value.id === id && value.size === size && (value.color || '') === color);
    if (!item) return;
    item.qty += amount;
    if (item.qty < 1) cart = cart.filter(value => value !== item);
    persist(); renderCart(); renderCheckoutSummary();
  }
  function removeItem(id, size, color) { cart = cart.filter(item => !(item.id === id && item.size === size && (item.color || '') === color)); persist(); renderCart(); renderCheckoutSummary(); }

  function renderCheckoutSummary() {
    const target = $('#checkoutSummary');
    if (!target) return;
    target.innerHTML = cart.map(item => {
      const product = products.find(value => value.id === item.id);
      if (!product) return '';
      return `<div class="summary-line"><span>${item.qty} × ${text(product.name)}${item.size === 'A confirmar' ? ' · tamanho a confirmar' : ` · tam. ${text(item.size)}`}${item.color ? ` · ${text(item.color)}` : ''}</span><b>${money(product.price * item.qty)}</b></div>`;
    }).join('');
    $('#checkoutTotal').textContent = money(cartTotal());
  }
  function selectedFulfillment() { return $('input[name="fulfillment"]:checked')?.value || 'pickup'; }
  function updateChoices() {
    $$('.choice-card').forEach(card => card.classList.toggle('selected', $('input', card).checked));
    $$('.payment-option').forEach(card => card.classList.toggle('selected', $('input', card).checked));
    $('#deliveryFields')?.classList.toggle('hidden', selectedFulfillment() !== 'delivery');
    renderCheckoutSummary();
  }
  function formatCep(value) { const digits = value.replace(/\D/g, '').slice(0, 8); return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits; }
  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length > 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    if (digits.length > 6) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return digits.length > 2 ? `(${digits.slice(0, 2)}) ${digits.slice(2)}` : digits;
  }
  async function lookupCep() {
    const cep = $('#cepInput').value.replace(/\D/g, '');
    if (cep.length !== 8) { toast('Digite um CEP com 8 números'); return; }
    const button = $('#quoteShipping');
    button.disabled = true; button.textContent = 'Consultando…';
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) throw new Error('CEP indisponível');
      const address = await response.json();
      if (address.erro) throw new Error('CEP não encontrado');
      shippingAddress = address;
      $('#addressResult').textContent = [address.logradouro, address.bairro, address.localidade, address.uf, formatCep(cep)].filter(Boolean).join(' · ');
      $('#freightResult').textContent = 'Endereço localizado. Consulte a disponibilidade e o valor da entrega com a Donna Maria pelo WhatsApp.';
    } catch (error) {
      shippingAddress = null;
      $('#addressResult').textContent = error.message === 'Failed to fetch' ? 'Não foi possível consultar o CEP. Confira sua conexão e tente novamente.' : error.message;
      $('#freightResult').textContent = '';
    } finally { button.disabled = false; button.textContent = 'Consultar CEP'; }
  }
  function placeOrder() {
    const name = $('#buyerName').value.trim();
    const phone = $('#buyerPhone').value.replace(/\D/g, '');
    if (!name) { $('#buyerName').focus(); toast('Informe seu nome para continuar'); return; }
    if (phone.length < 10 || phone.length > 11) { $('#buyerPhone').focus(); toast('Confira o número de WhatsApp'); return; }
    if (!cart.length) { toast('Sua sacola está vazia'); closeAll(); return; }
    const delivery = selectedFulfillment() === 'delivery';
    if (delivery && !shippingAddress) { toast('Consulte o CEP para confirmar o endereço'); $('#cepInput').focus(); return; }
    if (delivery && !$('#addressExtra').value.trim()) { toast('Informe o número do endereço'); $('#addressExtra').focus(); return; }
    const payment = $('input[name="payment"]:checked')?.value || 'Pix';
    const lines = cart.map(item => {
      const product = products.find(value => value.id === item.id);
      return `• ${item.qty}x ${product.name}${item.size === 'A confirmar' ? ' (tamanho a confirmar)' : ` (tamanho: ${item.size})`}${item.color ? ` · cor: ${item.color}` : ''} — ${money(product.price * item.qty)}`;
    });
    const destination = delivery ? `Entrega: ${shippingAddress.logradouro || ''} ${$('#addressExtra').value}, ${shippingAddress.bairro || ''}, ${shippingAddress.localidade}/${shippingAddress.uf} — CEP ${shippingAddress.cep}. Confirmar disponibilidade e frete.` : 'Retirada: Estância/SE · endereço a confirmar com a loja.';
    const message = `Olá! Quero confirmar um pedido pela Donna Maria.\n\n${lines.join('\n')}\n\nSubtotal demonstrativo: ${money(cartTotal())}\nFrete: confirmar com a loja.\n${destination}\nPagamento preferido: ${payment}\n\nNome: ${name}\nWhatsApp: ${$('#buyerPhone').value}\n\nPor favor, confirme preço, tamanhos, disponibilidade e próximos passos.`;
    $('#whatsappOrder').href = `https://wa.me/5579996520909?text=${encodeURIComponent(message)}`;
    $('#checkoutForm').classList.add('hidden');
    $('#orderSuccess').classList.remove('hidden');
  }
  function renderSizeGuide() {
    const sizes = ['PP', 'P', 'M', 'G', 'GG'];
    const metrics = ['Busto', 'Cintura', 'Quadril'];
    const rows = window.DonnaSizeGuide?.measurements || {};
    $('#sizeGuideTable').innerHTML = `<thead><tr><th scope="col">Medida</th>${sizes.map(size => `<th scope="col">${size}</th>`).join('')}</tr></thead><tbody>${metrics.map(metric => `<tr><th scope="row">${metric} (cm)</th>${sizes.map(size => `<td>${text(rows?.[size]?.[metric] || '—')}</td>`).join('')}</tr>`).join('')}</tbody>`;
    openPanel(sizeGuide);
  }
  async function shareProduct(id) {
    const product = products.find(item => item.id === id);
    if (!product) return;
    const url = new URL(`produtos.html#peca-${encodeURIComponent(product.id)}`, window.location.href).href;
    try {
      if (navigator.share) await navigator.share({ title: `${product.name} · Donna Maria`, text: 'Veja esta peça da Donna Maria.', url });
      else { await navigator.clipboard.writeText(url); toast('Link da peça copiado'); }
    } catch (error) { if (error.name !== 'AbortError') toast('Não foi possível compartilhar agora'); }
  }

  document.addEventListener('click', event => {
    const tab = event.target.closest('[data-category]');
    if (tab) { setCategory(tab.dataset.category); return; }
    const favorite = event.target.closest('[data-favorite]');
    if (favorite) { event.stopPropagation(); toggleFavorite(favorite.dataset.favorite); return; }
    const detail = event.target.closest('[data-detail]');
    if (detail) { showProduct(detail.dataset.detail); return; }
    const card = event.target.closest('[data-product]');
    if (card) { showProduct(card.dataset.product); return; }
    const clear = event.target.closest('[data-clear-filters]');
    if (clear) { category = 'Todos'; query = ''; $('#productSearch').value = ''; ['#filterSize', '#filterColor', '#filterPrice'].forEach(selector => { if ($(selector)) $(selector).value = ''; }); if ($('#filterNew')) $('#filterNew').checked = false; renderProducts(); return; }
    const gallery = event.target.closest('[data-gallery]');
    if (gallery) { moveGallery(Number(gallery.dataset.gallery)); return; }
    const galleryDot = event.target.closest('[data-gallery-index]');
    if (galleryDot) { const targetIndex = Number(galleryDot.dataset.galleryIndex); moveGallery(targetIndex - quickImageIndex); return; }
    const size = event.target.closest('[data-size]');
    if (size) { selectedSize = size.dataset.size; $$('.size-option').forEach(button => { const active = button === size; button.classList.toggle('selected', active); button.setAttribute('aria-pressed', String(active)); }); return; }
    const color = event.target.closest('[data-color]');
    if (color) { selectedColor = color.dataset.color; $$('.color-option').forEach(button => { const active = button === color; button.classList.toggle('selected', active); button.setAttribute('aria-pressed', String(active)); }); return; }
    if (event.target.closest('#detailAdd')) { addToCart(); return; }
    const share = event.target.closest('[data-share]');
    if (share) { shareProduct(share.dataset.share); return; }
    if (event.target.closest('#detailSizeGuide, #openSizeGuide')) { renderSizeGuide(); return; }
    const quantity = event.target.closest('[data-qty]');
    if (quantity) { const [id, size, color, delta] = quantity.dataset.qty.split('|').map(decodeURIComponent); setQuantity(id, size, color, Number(delta)); return; }
    const remove = event.target.closest('[data-remove]');
    if (remove) { const [id, size, color] = remove.dataset.remove.split('|').map(decodeURIComponent); removeItem(id, size, color); return; }
  });

  $('#productSearch')?.addEventListener('input', event => { query = event.target.value; renderProducts(); });
  $('#sortSelect')?.addEventListener('change', event => { sort = event.target.value; renderProducts(); });
  ['#filterSize', '#filterColor', '#filterPrice', '#filterNew'].forEach(selector => $(selector)?.addEventListener('change', renderProducts));
  $('#searchOpen')?.addEventListener('click', () => { $('#searchBox')?.classList.toggle('open'); $('#searchBox')?.classList.contains('open') && $('#productSearch')?.focus(); });
  $('#searchClose')?.addEventListener('click', () => { $('#productSearch').value = ''; query = ''; $('#searchBox')?.classList.remove('open'); renderProducts(); });
  $('#favoritesShortcut')?.addEventListener('click', () => { setCategory('Favoritos'); $('#colecao')?.scrollIntoView({ behavior: 'smooth' }); });
  document.addEventListener('click', event => { const link = event.target.closest('[data-category-link]'); if (link) setCategory(link.dataset.categoryLink); });
  $('#cartOpen')?.addEventListener('click', () => openPanel(cartDrawer));
  $('#checkoutOpen')?.addEventListener('click', () => { if (!cart.length) return toast('Sua sacola está vazia'); $('#checkoutForm').classList.remove('hidden'); $('#orderSuccess').classList.add('hidden'); shippingAddress = null; $('#freightResult').textContent = ''; $('#addressResult').textContent = ''; openPanel(checkoutModal); renderCheckoutSummary(); });
  $('#continueShopping')?.addEventListener('click', () => closePanel(cartDrawer));
  $('#backToCart')?.addEventListener('click', () => { closePanel(checkoutModal); openPanel(cartDrawer); });
  document.addEventListener('change', event => { if (event.target.matches('input[name="fulfillment"],input[name="payment"]')) updateChoices(); });
  $('#quoteShipping')?.addEventListener('click', lookupCep);
  $('#cepInput')?.addEventListener('input', event => { event.target.value = formatCep(event.target.value); shippingAddress = null; $('#addressResult').textContent = ''; $('#freightResult').textContent = ''; });
  $('#buyerPhone')?.addEventListener('input', event => { event.target.value = formatPhone(event.target.value); });
  $('#placeOrder')?.addEventListener('click', placeOrder);
  $('#whatsappOrder')?.addEventListener('click', () => {
    const order = {
      id: `DM-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      name: $('#buyerName').value.trim(),
      phone: $('#buyerPhone').value,
      payment: $('input[name="payment"]:checked')?.value || 'A confirmar',
      fulfillment: selectedFulfillment() === 'delivery' ? 'Entrega' : 'Retirada',
      destination: selectedFulfillment() === 'delivery' && shippingAddress ? `${shippingAddress.logradouro || ''} ${$('#addressExtra').value}, ${shippingAddress.bairro || ''}, ${shippingAddress.localidade || ''}/${shippingAddress.uf || ''} · CEP ${shippingAddress.cep} · frete a confirmar` : 'Estância/SE · endereço a confirmar',
      total: cartTotal(),
      totalLabel: 'Subtotal demonstrativo · frete a confirmar',
      status: 'Novo',
      items: cart.map(item => {
        const product = products.find(value => value.id === item.id);
        return { id: item.id, name: product?.name || item.id, size: item.size, color: item.color || '', qty: item.qty, price: product?.price || 0, image: product?.image || '' };
      })
    };
    const orders = readStore('donna-orders', []);
    orders.unshift(order);
    try { localStorage.setItem('donna-orders', JSON.stringify(orders)); } catch { /* The WhatsApp link still works if storage is unavailable. */ }
  });
  $('#finishOrder')?.addEventListener('click', () => { closeAll(); cart = []; persist(); renderCart(); $('#checkoutForm').classList.remove('hidden'); $('#orderSuccess').classList.add('hidden'); });
  $('#overlay')?.addEventListener('click', closeAll);
  document.addEventListener('click', event => { if (event.target.closest('[data-close]')) closeAll(); });
  $('#menuToggle')?.addEventListener('click', () => { const nav = $('#mainNav'); const open = nav.classList.toggle('open'); $('#menuToggle').setAttribute('aria-expanded', String(open)); });
  $('#mainNav')?.addEventListener('click', event => { if (event.target.closest('a')) { $('#mainNav').classList.remove('open'); $('#menuToggle')?.setAttribute('aria-expanded', 'false'); } });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeAll(); $('#mainNav')?.classList.remove('open'); }
    if (event.key === 'Tab') {
      const panel = panels.find(item => item.classList.contains('open'));
      if (!panel) return;
      const focusable = $$('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled])', panel).filter(item => item.offsetParent !== null);
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0].focus(); }
    }
  });
  $('#detailImage')?.addEventListener('touchstart', event => { $('#detailImage').dataset.touchStart = event.changedTouches[0].clientX; }, { passive: true });
  $('#detailImage')?.addEventListener('touchend', event => { const start = Number($('#detailImage').dataset.touchStart); const distance = event.changedTouches[0].clientX - start; if (Math.abs(distance) > 45) moveGallery(distance < 0 ? 1 : -1); }, { passive: true });
  document.addEventListener('click', event => { if (event.target.closest('a[href^="https://www.instagram.com/"]')) { /* Instagram links are configured manually. */ } });
  window.addEventListener('storage', event => {
    if (event.key === 'donna-products') { products = catalog.load(); updateFilterOptions(); renderProducts(); renderCart(); }
    if (event.key === 'donna-favorites') { favorites = readStore('donna-favorites', []); renderProducts(); }
    if (event.key === 'donna-cart') { cart = readStore('donna-cart', []); renderCart(); }
  });

  updateFilterOptions();
  renderProducts();
  renderCart();
  updateChoices();
  if (location.hash.startsWith('#peca-')) {
    const sharedId = decodeURIComponent(location.hash.slice(6));
    requestAnimationFrame(() => showProduct(sharedId));
  }
})();

