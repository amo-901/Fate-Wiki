let allServants = [];   // keeps the fetched data around so the popup can use it later

fetch('data/servants.json')
  .then(response => response.json())
  .then(data => {
    allServants = data;
    renderGrid(allServants);
  });

function renderGrid(servants) {
  const grid = document.getElementById('cardsGrid');
  grid.innerHTML = '';

  servants.forEach((servant) => {
    const slot = document.createElement('div');
    slot.classList.add('servant-card-slot');

    const img = document.createElement('img');
    img.classList.add('servant-card');
    img.src = `images/Servants/${servant.servant_id}/Archetype.webp`;
    img.alt = servant.servant_name;
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
      openServantModal(servant);
    });

    slot.appendChild(img);
    grid.appendChild(slot);
  });
}

function openServantModal(servant) {
  document.getElementById('modalPortrait').src =
    `images/Servants/${servant.servant_id}/Archetype.webp`;

  const skillsContainer = document.getElementById('modalSkills');
  skillsContainer.innerHTML = '';   // clear any previous servant's skills first

  const deckContainer = document.getElementById('modalDeck');
  deckContainer.innerHTML = '';

  servant.skills.forEach((skill) => {
    const img = document.createElement('img');
    img.src = getSkillImagePath(servant, skill);
    img.alt = skill.skill_name;
    img.loading = 'lazy';
    skillsContainer.appendChild(img);
  });

  const deckPaths = getDeckCardPaths(servant);   // step 1: get the finished list of 12 paths

  deckPaths.forEach((path) => {                   // step 2: turn each path into a visible image
    const img = document.createElement('img');
    img.classList.add('deck-card');
    img.src = path;
    img.loading = 'lazy';
    deckContainer.appendChild(img);
  });

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

// closing the modal: either button click, or clicking the dark overlay outside it
document.getElementById('modalClose').addEventListener('click', closeServantModal);
document.getElementById('modalOverlay').addEventListener('click', (event) => {
  if (event.target.id === 'modalOverlay') {
    closeServantModal();
  }
});

function closeServantModal() {
  document.getElementById('modalOverlay').classList.remove('is-open');
}