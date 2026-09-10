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

function openMasterModal(master) {
  document.getElementById('modalPortrait').src =
    `images/Masters/${master.master_id}/Profile.webp`;

  const abilityHeading = document.getElementById('ability-heading')
  const abilityContainer = document.getElementById('modalAbilities');
  abilityHeading.classList.add('hidden')
  abilityContainer.classList.add('hidden')
  abilityContainer.innerHTML = '';   // clear any previous master's abilities first

  const masterName = document.getElementById('master-name')
  masterName.textContent = '';

  masterName.textContent = master.master_name;
  document.getElementById('master-description').textContent = master.description || 'No description available.';

  const assetsHeading = document.getElementById('assets-heading');
  const assetContainer = document.getElementById('modalAssets');
  assetsHeading.classList.add('hidden')
  assetContainer.classList.add('hidden')
  assetContainer.innerHTML = '';

  if (master.has_abilities) {
    abilityHeading.classList.remove('hidden');
    abilityContainer.classList.remove('hidden');
    
    master.abilities.forEach((ability) => {
    const img = document.createElement('img');
    img.classList.add('ability-card');
    img.src = getAbilityImagePath(master, ability);
    img.alt = ability.card_name;
    img.loading = 'lazy';
    abilityContainer.appendChild(img);
    });
  } else {
    abilityHeading.classList.add('hidden');
    abilityContainer.classList.add('hidden');
  }
  
  if (master.has_assets) {
    assetsHeading.classList.remove('hidden');
    assetContainer.classList.remove('hidden');

    master.assets.forEach((asset) => {
    const img = document.createElement('img');
    img.classList.add('asset-card');
    img.src = getAssetPath(master, asset);
    img.alt = asset.card_name;
    img.loading = 'lazy';
    assetContainer.appendChild(img);
    });
  } else {
    assetsHeading.classList.add('hidden');
    assetContainer.classList.add('hidden');
  }

  document.getElementById('modalOverlay').classList.add('is-open');
}

function getAbilityImagePath(master, ability) {
    return `images/Masters/${master.master_id}/Abilities/Ability${ability.ability_order}.webp`;
}

function getAssetPath(master, asset) {
    return `images/Masters/${master.master_id}/Assets/Asset${asset.asset_order}.webp`;
}

document.getElementById('modalClose').addEventListener('click', closeMasterModal);
document.getElementById('modalOverlay').addEventListener('click', (event) => {
  if (event.target.id === 'modalOverlay') {
    closeMasterModal();
  }
});

function closeMasterModal() {
  document.getElementById('modalOverlay').classList.remove('is-open');
}