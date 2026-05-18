(function () {
  var SUPABASE_URL = 'https://vojdaehzdjoskbhrxccr.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvamRhZWh6ZGpvc2tiaHJ4Y2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMDcxOTksImV4cCI6MjA5NDY4MzE5OX0.Br7h--HdKoMHxtONrIva9L0qUFB8A8AJk3WnyhtImPQ';
  var BUCKET = 'gallery';

  var db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // ── Pantallas ────────────────────────────────────────────────

  function showAdmin(user) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('userEmail').textContent = user.email;
    loadItems();
  }

  function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
  }

  // ── Mensajes ─────────────────────────────────────────────────

  function showMsg(id, type, text) {
    var el = document.getElementById(id);
    el.className = 'msg msg-' + type;
    el.textContent = text;
  }

  function clearMsg(id) {
    var el = document.getElementById(id);
    el.className = 'msg';
    el.textContent = '';
  }

  // ── Login ────────────────────────────────────────────────────

  document.getElementById('loginBtn').addEventListener('click', async function () {
    var email = document.getElementById('loginEmail').value.trim();
    var pass  = document.getElementById('loginPass').value;
    if (!email || !pass) { showMsg('loginMsg', 'err', 'Completá los dos campos.'); return; }

    this.disabled = true;
    this.innerHTML = '<span class="spinner"></span> Ingresando…';

    var { data, error } = await db.auth.signInWithPassword({ email: email, password: pass });

    this.disabled = false;
    this.textContent = 'Ingresar';

    if (error) { showMsg('loginMsg', 'err', 'Email o contraseña incorrectos.'); return; }
    clearMsg('loginMsg');
    showAdmin(data.user);
  });

  document.getElementById('loginPass').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('loginBtn').click();
  });

  document.getElementById('logoutBtn').addEventListener('click', async function () {
    await db.auth.signOut();
    showLogin();
  });

  // ── Dropzone ─────────────────────────────────────────────────

  var dropzone = document.getElementById('dropzone');

  dropzone.addEventListener('click', function () {
    document.getElementById('fileInput').click();
  });

  dropzone.addEventListener('dragover', function (e) {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });

  dropzone.addEventListener('dragleave', function () {
    dropzone.classList.remove('drag-over');
  });

  dropzone.addEventListener('drop', function (e) {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    var file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) setFile(file);
  });

  document.getElementById('fileInput').addEventListener('change', function () {
    if (this.files[0]) setFile(this.files[0]);
  });

  function setFile(file) {
    document.getElementById('fileInput')._selectedFile = file;
    document.getElementById('fileName').textContent = file.name;
    loadPreview(file);
  }

  // ── Preview arrastrable ──────────────────────────────────────

  var drag = {
    active:    false,
    startX:    0,
    startY:    0,
    offsetX:   0,   // píxeles desde borde izquierdo/top del overflow
    offsetY:   0,
    overflowX: 0,   // px totales de overflow horizontal
    overflowY: 0,
    posX:      50,  // % final 0-100
    posY:      50
  };

  function loadPreview(file) {
    var img    = document.getElementById('previewImg');
    var frame  = document.getElementById('previewFrame');
    var wrap   = document.getElementById('previewWrap');
    var objUrl = URL.createObjectURL(file);

    img.onload = function () {
      var cW = frame.offsetWidth;
      var cH = frame.offsetHeight;   // 260px fijo
      var iW = img.naturalWidth;
      var iH = img.naturalHeight;

      var scale    = Math.max(cW / iW, cH / iH);
      drag.overflowX = Math.max(0, iW * scale - cW);
      drag.overflowY = Math.max(0, iH * scale - cH);

      // Centrar al cargar
      drag.offsetX = drag.overflowX / 2;
      drag.offsetY = drag.overflowY / 2;
      applyPosition();

      wrap.style.display = 'block';
    };

    img.src = objUrl;
  }

  function applyPosition() {
    var img = document.getElementById('previewImg');

    drag.posX = drag.overflowX > 0 ? drag.offsetX / drag.overflowX * 100 : 50;
    drag.posY = drag.overflowY > 0 ? drag.offsetY / drag.overflowY * 100 : 50;

    var px = drag.posX.toFixed(1);
    var py = drag.posY.toFixed(1);
    img.style.objectPosition = px + '% ' + py + '%';
    document.getElementById('posLabel').textContent = 'Posición: ' + Math.round(drag.posX) + '% · ' + Math.round(drag.posY) + '%';
  }

  // Mouse
  document.getElementById('previewFrame').addEventListener('mousedown', function (e) {
    e.preventDefault();
    drag.active = true;
    drag.startX = e.clientX;
    drag.startY = e.clientY;
    this.classList.add('dragging');
  });

  document.addEventListener('mousemove', function (e) {
    if (!drag.active) return;
    var dx = e.clientX - drag.startX;
    var dy = e.clientY - drag.startY;
    drag.startX = e.clientX;
    drag.startY = e.clientY;
    // Arrastrar imagen: mover en dirección contraria al cursor
    drag.offsetX = Math.max(0, Math.min(drag.overflowX, drag.offsetX - dx));
    drag.offsetY = Math.max(0, Math.min(drag.overflowY, drag.offsetY - dy));
    applyPosition();
  });

  document.addEventListener('mouseup', function () {
    if (!drag.active) return;
    drag.active = false;
    document.getElementById('previewFrame').classList.remove('dragging');
  });

  // Touch
  document.getElementById('previewFrame').addEventListener('touchstart', function (e) {
    var t = e.touches[0];
    drag.active = true;
    drag.startX = t.clientX;
    drag.startY = t.clientY;
  }, { passive: true });

  document.getElementById('previewFrame').addEventListener('touchmove', function (e) {
    if (!drag.active) return;
    e.preventDefault();
    var t = e.touches[0];
    var dx = t.clientX - drag.startX;
    var dy = t.clientY - drag.startY;
    drag.startX = t.clientX;
    drag.startY = t.clientY;
    drag.offsetX = Math.max(0, Math.min(drag.overflowX, drag.offsetX - dx));
    drag.offsetY = Math.max(0, Math.min(drag.overflowY, drag.offsetY - dy));
    applyPosition();
  }, { passive: false });

  document.getElementById('previewFrame').addEventListener('touchend', function () {
    drag.active = false;
  });

  // Botón centrar
  document.getElementById('resetPos').addEventListener('click', function () {
    drag.offsetX = drag.overflowX / 2;
    drag.offsetY = drag.overflowY / 2;
    applyPosition();
  });

  // ── Upload ───────────────────────────────────────────────────

  document.getElementById('uploadBtn').addEventListener('click', async function () {
    var file     = document.getElementById('fileInput')._selectedFile || document.getElementById('fileInput').files[0];
    var title    = document.getElementById('imgTitle').value.trim();
    var category = document.getElementById('imgCategory').value;

    if (!file)  { showMsg('uploadMsg', 'err', 'Elegí una imagen primero.'); return; }
    if (!title) { showMsg('uploadMsg', 'err', 'Escribí un título para la imagen.'); return; }

    clearMsg('uploadMsg');
    this.disabled = true;
    this.innerHTML = '<span class="spinner"></span> Subiendo…';

    var ext  = file.name.split('.').pop().toLowerCase();
    var slug = title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    var path = Date.now() + '-' + slug + '.' + ext;

    var { error: storageErr } = await db.storage.from(BUCKET).upload(path, file, { upsert: false });

    if (storageErr) {
      showMsg('uploadMsg', 'err', 'Error al subir archivo: ' + storageErr.message);
      this.disabled = false;
      this.textContent = 'Subir imagen';
      return;
    }

    var imageUrl       = SUPABASE_URL + '/storage/v1/object/public/' + BUCKET + '/' + path;
    var objectPosition = drag.posX.toFixed(1) + '% ' + drag.posY.toFixed(1) + '%';

    var { error: dbErr } = await db.from('gallery_items').insert({
      title:           title,
      category:        category,
      image_url:       imageUrl,
      object_position: objectPosition,
      display_order:   Date.now()
    });

    if (dbErr) {
      showMsg('uploadMsg', 'err', 'Imagen subida pero error al guardar datos: ' + dbErr.message);
      this.disabled = false;
      this.textContent = 'Subir imagen';
      return;
    }

    showMsg('uploadMsg', 'ok', '¡Imagen subida con éxito!');
    document.getElementById('fileInput').value = '';
    document.getElementById('fileInput')._selectedFile = null;
    document.getElementById('fileName').textContent = '';
    document.getElementById('imgTitle').value = '';
    document.getElementById('previewWrap').style.display = 'none';
    drag.posX = 50; drag.posY = 50;
    this.disabled = false;
    this.textContent = 'Subir imagen';
    loadItems();
  });

  // ── Cargar ítems ─────────────────────────────────────────────

  async function loadItems() {
    var list    = document.getElementById('itemsList');
    var heading = document.getElementById('itemsHeading');
    list.innerHTML = '<p class="gallery-empty-msg">Cargando…</p>';

    var { data, error } = await db.from('gallery_items').select('*').order('display_order', { ascending: true });

    if (error) {
      list.innerHTML = '<p class="gallery-empty-msg" style="color:#c72525">Error al cargar las imágenes.</p>';
      return;
    }

    heading.textContent = 'Imágenes en galería (' + (data ? data.length : 0) + ')';

    if (!data || data.length === 0) {
      list.innerHTML = '<p class="gallery-empty-msg">No hay imágenes todavía. Subí la primera arriba.</p>';
      return;
    }

    var html = '<div class="items-list">';
    data.forEach(function (item) {
      var pos = item.object_position || '50% 50%';
      html += '<div class="item-row">' +
        '<img src="' + item.image_url + '" alt="' + (item.alt_text || item.title) + '" style="object-position:' + pos + '">' +
        '<div class="item-info">' +
          '<strong>' + item.title + '</strong>' +
          '<span class="badge ' + item.category + '">' + item.category + '</span>' +
        '</div>' +
        '<button class="btn btn-danger" data-id="' + item.id + '" data-url="' + item.image_url + '">Borrar</button>' +
      '</div>';
    });
    html += '</div>';
    list.innerHTML = html;

    list.querySelectorAll('.btn-danger').forEach(function (btn) {
      btn.addEventListener('click', function () {
        deleteItem(this.dataset.id, this.dataset.url);
      });
    });
  }

  // ── Borrar ítem ──────────────────────────────────────────────

  async function deleteItem(id, imageUrl) {
    if (!confirm('¿Borrar esta imagen? No se puede deshacer.')) return;

    var prefix = SUPABASE_URL + '/storage/v1/object/public/' + BUCKET + '/';
    if (imageUrl.startsWith(prefix)) {
      await db.storage.from(BUCKET).remove([imageUrl.slice(prefix.length)]);
    }

    var { error } = await db.from('gallery_items').delete().eq('id', id);
    if (error) { alert('Error al borrar: ' + error.message); return; }
    loadItems();
  }

  // ── Init ─────────────────────────────────────────────────────

  (async function () {
    var { data } = await db.auth.getSession();
    if (data.session) {
      showAdmin(data.session.user);
    } else {
      showLogin();
    }

    db.auth.onAuthStateChange(function (event) {
      if (event === 'SIGNED_OUT') showLogin();
    });
  })();
})();
