(function () {
  var SUPABASE_URL = 'https://vojdaehzdjoskbhrxccr.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvamRhZWh6ZGpvc2tiaHJ4Y2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMDcxOTksImV4cCI6MjA5NDY4MzE5OX0.Br7h--HdKoMHxtONrIva9L0qUFB8A8AJk3WnyhtImPQ';

  function applyFilter(category) {
    document.querySelectorAll('.gallery-item').forEach(function (item) {
      var show = category === 'all' || item.getAttribute('data-category') === category;
      item.style.display = show ? '' : 'none';
    });
  }

  function initFilters() {
    var filters = document.getElementById('galleryFilters');
    if (!filters) return;
    var buttons = filters.querySelectorAll('.filter-btn');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        applyFilter(btn.getAttribute('data-filter'));
      });
    });
  }

  function renderItems(data) {
    var grid = document.getElementById('galleryGrid');
    grid.innerHTML = data.map(function (item) {
      var pos = item.object_position || '50% 50%';
      return '<figure class="gallery-item" data-category="' + item.category + '">' +
        '<img src="' + item.image_url + '" alt="' + (item.alt_text || item.title) + '" loading="lazy" style="object-position:' + pos + '">' +
        '<figcaption>' + item.title + '</figcaption>' +
        '</figure>';
    }).join('');
    initFilters();
  }

  async function loadGallery() {
    var grid = document.getElementById('galleryGrid');
    if (!grid) return;

    grid.innerHTML = '<p class="gallery-status">Cargando imágenes…</p>';

    var client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    var result = await client
      .from('gallery_items')
      .select('title, alt_text, category, image_url, object_position')
      .order('display_order', { ascending: true });

    if (result.error) {
      grid.innerHTML = '<p class="gallery-status gallery-status--error">No se pudieron cargar las imágenes.</p>';
      console.error(result.error);
      return;
    }

    if (!result.data || result.data.length === 0) {
      grid.innerHTML = '<p class="gallery-status">No hay imágenes disponibles aún.</p>';
      return;
    }

    renderItems(result.data);
  }

  document.addEventListener('DOMContentLoaded', loadGallery);
})();
