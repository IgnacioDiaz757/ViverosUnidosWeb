// main.js — mobile menu toggle + gallery filters + form-to-whatsapp
document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if (toggle && menu) {
    function openMenu() {
      menu.classList.add('active');
      toggle.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      menu.classList.remove('active');
      toggle.classList.remove('active');
      document.body.style.overflow = '';
    }
    function toggleMenu() {
      menu.classList.contains('active') ? closeMenu() : openMenu();
    }

    toggle.addEventListener('click', toggleMenu);

    menu.querySelectorAll('.nav-link').forEach(function(link) {
      link.addEventListener('click', closeMenu);
    });

    // Cerrar al hacer click fuera del menú
    document.addEventListener('click', function(e) {
      if (menu.classList.contains('active') &&
          !menu.contains(e.target) &&
          !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    // Cerrar si se pasa al breakpoint desktop
    window.addEventListener('resize', function() {
      if (window.innerWidth > 720) closeMenu();
    });
  }

  // Contact form → WhatsApp
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const required = this.querySelectorAll('[required]');
      let ok = true;
      required.forEach(function(field) {
        if (!field.value.trim()) { field.style.borderColor = '#C72525'; ok = false; }
        else { field.style.borderColor = ''; }
      });
      if (!ok) { alert('Por favor completá los campos obligatorios.'); return; }

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const subjectSel = document.getElementById('subject');
      const subject = subjectSel.options[subjectSel.selectedIndex].text;
      const message = document.getElementById('message').value.trim();
      const newsletter = document.getElementById('newsletter') && document.getElementById('newsletter').checked ? 'Sí' : 'No';

      const lines = [
        '*Nueva consulta desde la web Viveros Unidos*',
        'Nombre: ' + name,
        'Email: ' + email,
        phone ? 'Teléfono: ' + phone : null,
        'Asunto: ' + subject,
        'Newsletter: ' + newsletter,
        'Mensaje:',
        message,
      ].filter(Boolean).join('\n');

      const url = 'https://api.whatsapp.com/send?phone=5493512441605&text=' + encodeURIComponent(lines);
      window.open(url, '_blank');
      this.reset();
    });
  }

  // Set hero-page background image from data-hero-image
  document.querySelectorAll('.hero-page[data-hero-image]').forEach(function(el) {
    const url = el.getAttribute('data-hero-image');
    el.style.setProperty('--hero-image', "url('" + url + "')");
    el.classList.add('has-image');
  });
});
