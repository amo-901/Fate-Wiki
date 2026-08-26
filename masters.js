let allMasters = []; // empty list, we store the masters in here later

fetch('data/servants.json')
  .then(response => response.json())
  .then(data => {
    allMasters = data.masters;
    renderGrid(allMasters);
  });

function renderGrid(masters) {
  const grid = document.getElementById('cardsGrid');
  grid.innerHTML = '';

  masters.forEach((master) => {
    const slot = document.createElement('div');
    slot.classList.add('master-card-slot');

    const img = document.createElement('img');
    img.classList.add('master-card');
    img.src = `images/Masters/${master.master_id}/Profile.webp`;
    img.alt = master.master_name;
    img.loading = 'lazy'; // for making it easier to load website

    // --- new: tilt + lift ---
    img.addEventListener('mouseenter', () => {
      img.classList.add('is-hovering');
      img.style.transition = 'none';
    });

    img.addEventListener('mousemove', (event) => {
      const rect = img.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const percentX = (x / rect.width - 0.5) * 2;
      const percentY = (y / rect.height - 0.5) * 2;

      const rotateY = percentX * 16;
      const rotateX = percentY * -16;

      img.style.transform = `
        translateY(-20px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(1.06)
      `;
    });

    img.addEventListener('mouseleave', () => {
      img.classList.remove('is-hovering');
      img.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
      img.style.transform = 'translateY(0) rotateX(0deg) rotateY(0deg) scale(1)';
    });
    // --- end new ---

    img.addEventListener('click', () => {
      openMasterModal(master);
    });

    slot.appendChild(img);
    grid.appendChild(slot);
  });
}