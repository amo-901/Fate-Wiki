let allServants = [];   // keeps the fetched data around so the popup can use it later

let sortMode = 0; //this will tell you that the sort mode should be 0, the default. 

const sortModes = [
  { label: 'Default', compare: null },
  { label: 'A-Z', compare: (a, b) => a.servant_name.localeCompare(b.servant_name) },
  { label: 'Z-A', compare: (a, b) => b.servant_name.localeCompare(a.servant_name) }
]; // we create an array of objects. each object has a key value pair, for the sort label name. it has a compare key as well, and we pass a func into it
// arrow function taking two parameters, a and b. these will be two servant objects.
// localeCompare is a built in function that compares two strings and returns a positive number if the first argument belongs after the second argument alphabeticaly, negative if first argument goes first
// a, b argument is required to tell it to sort alphabetically

const allClasses = [
  "Saber", "Lancer", "Archer", "Rider", "Assassin", "Caster", "Berserker",
  "Ruler", "Avenger", "Foreigner", "Alter Ego", "Pretender", "Shielder",
  "Beast", "Moon Cancer"
]; // make a list of the existing classes in the game

const allPlaystyles = ["Bulwark", "Nuker", "Scammer", "Skirmisher", "Thrasher", "Wildcard"]; // make a list of existing playstyles

fetch('data/servants.json') // fetch the json file from the data folder
  .then(response => response.json()) // arrow function only fulfills after fetch is complete, converts raw data to json
  .then(data => {
    allServants = data.servants; //take all the servants from the json and store in all servants
    buildCheckboxGroup('classFilterGroup', allClasses, 'class-checkbox'); //running these functions, passing in the lists. 
    buildCheckboxGroup('playstyleFilterGroup', allPlaystyles, 'playstyle-checkbox');
    buildCheckboxGroup('prosFilterGroup', data.traitsList.pros, 'pro-checkbox'); // these grab the pros lists from the json
    buildCheckboxGroup('consFilterGroup', data.traitsList.cons, 'con-checkbox');
    renderGrid(allServants); 
    openServantFromUrl(); // this will read the current url and immediately load that servant modal data after the grid is rendered
  });


function renderGrid(servants) {
  const grid = document.getElementById('cardsGrid');
  grid.innerHTML = ''; //grid starts off empty

  servants.forEach((servant) => { // for each servant in the array of servants provided, forEach loops through array items
    const slot = document.createElement('div'); // create a div element called slot, as in the card slot
    slot.classList.add('servant-card-slot'); // make the slot part of this class, for the sake of CSS 

    const img = document.createElement('img'); // create an img element 
    img.classList.add('servant-card'); // give the img element the servant-card class 
    img.src = `images/Servants/${servant.servant_id}/Archetype.webp`; // image comes from this path, passing in the servant id 
    img.alt = servant.servant_name; // if the image doesnt load, just display the name of the servant
    img.loading = 'lazy'; // for making it easier to load website
    img.fetchPriority = 'low'; // low image fetch priority 

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

    img.addEventListener('click', () => {
      openServantModal(servant);
    });

    slot.appendChild(img); // append the image to the slot
    grid.appendChild(slot); //append the slot to the grid, this is what finally adds the servant to the grid
  });
}

function openServantModal(servant) {
  showServantModal(servant);
  history.pushState({ slug: servant.slug }, '', `?servant=${servant.slug}`);
}

function showServantModal(servant) {
  document.getElementById('modalPortrait').src =
    `images/Servants/${servant.servant_id}/Archetype.webp`;
  document.getElementById('modalPortrait').fetchPriority = 'high'

  const skillsContainer = document.getElementById('modalSkills');
  skillsContainer.innerHTML = '';   // clear any previous servant's skills first

  const deckContainer = document.getElementById('modalDeck');
  deckContainer.innerHTML = '';

  const servantName = document.getElementById('servant-name')
  servantName.textContent = '';

  servantName.textContent = servant.servant_name;
  document.getElementById('servant-description').textContent = servant.description || 'No description available.';

  const assetsHeading = document.getElementById('assets-heading');
  const assetContainer = document.getElementById('modalAssets');
  assetsHeading.classList.add('hidden')
  assetContainer.classList.add('hidden')
  assetContainer.innerHTML = '';

  servant.skills.forEach((skill) => {
    const img = document.createElement('img');
    img.src = getSkillImagePath(servant, skill);
    img.alt = skill.skill_name;
    img.fetchPriority = 'high';
    img.addEventListener('click', () => openImageLightbox(img.src, img.alt));   
    skillsContainer.appendChild(img);
  });

  const deckPaths = getDeckCardPaths(servant);   // step 1: get the finished list of 12 paths

  deckPaths.forEach((path) => {                   // step 2: turn each path into a visible image
    const img = document.createElement('img');
    img.classList.add('deck-card');
    img.src = path;
    img.fetchPriority = 'high';
    img.addEventListener('click', () => openImageLightbox(img.src, img.alt));  
    deckContainer.appendChild(img);
  });

  if (servant.has_assets) {
    assetsHeading.classList.remove('hidden');
    assetContainer.classList.remove('hidden');
    const assetPaths = getAssetPaths(servant);

    assetPaths.forEach((path) => {
      const img = document.createElement('img');
      img.classList.add('asset-card');
      img.src = path;
      img.fetchPriority = 'high';
      img.addEventListener('click', () => openImageLightbox(img.src, img.alt)); 
      assetContainer.appendChild(img);
    });
  } else {
    assetsHeading.classList.add('hidden');
    assetContainer.classList.add('hidden');
  }

  document.getElementById('modalOverlay').classList.add('is-open');
}

function getSkillImagePath(servant, skill) {
  if (skill.is_shared) {
    const filename = skill.skill_name.replace(/ /g, '_') + '.webp';
    return `images/Shared-Class-Skills/${filename}`;
  } else {
    return `images/Servants/${servant.servant_id}/Skill${skill.skill_order}.webp`;
  }
}

function getDeckCardPaths(servant) {
  const deckPaths = [];

  if (servant.deck_strength) {
    const strengthValues = servant.deck_strength.split(',');
    strengthValues.forEach((power) => {
      deckPaths.push(`images/Generic-Cards/Strength_${power}.webp`);
    });
  }

  if (servant.deck_agility) {
    const agilityValues = servant.deck_agility.split(',');
    agilityValues.forEach((power) => {
      deckPaths.push(`images/Generic-Cards/Agility_${power}.webp`);
    })
  }

  if (servant.deck_magic) {
    const magicValues = servant.deck_magic.split(',');
    magicValues.forEach((power) => {
      deckPaths.push(`images/Generic-Cards/Magic_${power}.webp`);
    })
  }

  if (servant.deck_special) {
    const specialValues = servant.deck_special.split(',');
    specialValues.forEach((card) => {
      deckPaths.push(`images/Generic-Cards/${card}.webp`);
    })
  }

  if (servant.has_unique) {
    servant.uniqueCards.forEach((card) => {
      for (let i = 0; i < card.quantity; i++) {
        deckPaths.push(`images/Servants/${servant.servant_id}/${card.card_slug}.webp`);
      }
    });
  }
  return deckPaths;
}

function getAssetPaths(servant) {
  const assetPaths = [];

  if (servant.has_assets) {
    servant.miscCards.forEach((card) => {
      for (let i = 0; i < card.quantity; i++) {
        assetPaths.push(`images/Servants/${servant.servant_id}/Assets/${card.card_slug}.webp`)
      }
    })
  }

  return assetPaths;
}

function buildCheckboxGroup(containerId, values, checkboxClass) {
  const group = document.getElementById(containerId);

  values.forEach((value) => {
    const label = document.createElement('label');
    label.classList.add('filter-checkbox-label');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = value;
    checkbox.classList.add(checkboxClass);
    checkbox.addEventListener('change', applyFilters);   // instant filtering

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(' ' + value));

    group.appendChild(label);
  });
}

function getCheckedValues(checkboxClass) {
  const checked = document.querySelectorAll(`.${checkboxClass}:checked`);
  return Array.from(checked).map((checkbox) => checkbox.value);
}

function applyFilters() {
  const searchText = document.getElementById('sidebarSearch').value.toLowerCase();
  const selectedClasses = getCheckedValues('class-checkbox');
  const selectedPlaystyles = getCheckedValues('playstyle-checkbox');
  const selectedPros = getCheckedValues('pro-checkbox');
  const selectedCons = getCheckedValues('con-checkbox');

  const filteredServants = allServants.filter((servant) => {
    const matchesSearch = servant.servant_name.toLowerCase().includes(searchText);
    const matchesClass = selectedClasses.length === 0 || selectedClasses.includes(servant.class);
    const matchesPlaystyle = selectedPlaystyles.length === 0 || selectedPlaystyles.includes(servant.playstyle);
    const matchesPros = selectedPros.every((trait) => servant.traits.pros.includes(trait));
    const matchesCons = selectedCons.every((trait) => servant.traits.cons.includes(trait));
    return matchesSearch && matchesClass && matchesPlaystyle && matchesPros && matchesCons;
  });

  const compare = sortModes[sortMode].compare;      
  if (compare) {                                    
    filteredServants.sort(compare);                 
  }                                                 

  renderGrid(filteredServants);
}

let searchDebounceTimer;

function openImageLightbox(imageSrc, imageAlt) {
  document.getElementById('lightboxImage').src = imageSrc;
  document.getElementById('lightboxImage').alt = imageAlt;
  document.getElementById('imageLightbox').classList.add('is-open');
}

function closeImageLightbox() {
  document.getElementById('imageLightbox').classList.remove('is-open');
}

document.getElementById('lightboxClose').addEventListener('click', closeImageLightbox);
document.getElementById('imageLightbox').addEventListener('click', (event) => {
  if (event.target.id === 'imageLightbox') {
    closeImageLightbox();
  }
});

document.getElementById('sidebarSearch').addEventListener('input', () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(applyFilters, 150);
});

document.getElementById('filterToggle').addEventListener('click', () => {
  document.getElementById('filterSidebar').classList.toggle('is-open');   
});

// clicking anywhere outside the sidebar closes it
document.addEventListener('click', (event) => {
  const sidebar = document.getElementById('filterSidebar');
  const clickedInsideSidebar = event.target.closest('#filterSidebar');
  const clickedFilterButton = event.target.closest('#filterToggle');

  if (!clickedInsideSidebar && !clickedFilterButton) {
    sidebar.classList.remove('is-open');
  }
});

document.getElementById('sidebarClose').addEventListener('click', () => {
  document.getElementById('filterSidebar').classList.remove('is-open');
});

document.getElementById('resetFilters').addEventListener('click', () => {
  document.getElementById('sidebarSearch').value = '';
  document.querySelectorAll('.filter-sidebar input[type="checkbox"]').forEach((checkbox) => {
    checkbox.checked = false;
  });
  applyFilters();
});

// closing the modal: either button click, or clicking the dark overlay outside it
document.getElementById('modalClose').addEventListener('click', closeServantModal);
document.getElementById('modalOverlay').addEventListener('click', (event) => {
  if (event.target.id === 'modalOverlay') {
    closeServantModal();
  }
});

function closeServantModal() {
  document.getElementById('modalOverlay').classList.remove('is-open');
  if (new URLSearchParams(window.location.search).has('servant')) {
    history.pushState({}, '', window.location.pathname);   // back to plain servants.html
  }
}

function buildSortMenu() {
  const menu = document.getElementById('sortMenu');

  sortModes.forEach((mode, index) => {
    const item = document.createElement('li');
    item.classList.add('sort-option');
    item.textContent = mode.label;
    item.addEventListener('click', () => chooseSort(index));
    menu.appendChild(item);
  });

  highlightActiveSort();
}

function highlightActiveSort() {
  document.querySelectorAll('.sort-option').forEach((item, index) => {
    item.classList.toggle('active', index === sortMode);
  });
}

function chooseSort(index) {
  sortMode = index;
  document.getElementById('sortToggle').textContent = 'Sort: ' + sortModes[index].label;
  document.getElementById('sortMenu').classList.add('hidden');
  highlightActiveSort();
  applyFilters();
}

document.getElementById('sortToggle').addEventListener('click', () => {
  document.getElementById('sortMenu').classList.toggle('hidden');
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.sort-dropdown')) {
    document.getElementById('sortMenu').classList.add('hidden');
  }
});

function getSlugFromUrl() {
  return new URLSearchParams(window.location.search).get('servant');
}

function openServantFromUrl() {
  const servant = allServants.find((s) => s.slug === getSlugFromUrl());
  if (servant) showServantModal(servant);   // no pushState: the URL is already right
}

// runs when the user presses the browser's Back/Forward buttons
window.addEventListener('popstate', () => {
  const servant = allServants.find((s) => s.slug === getSlugFromUrl());
  if (servant) {
    showServantModal(servant);
  } else {
    document.getElementById('modalOverlay').classList.remove('is-open');
  }
});

buildSortMenu();