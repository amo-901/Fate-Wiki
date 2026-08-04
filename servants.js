let allServants = [];   // keeps the fetched data around so the popup can use it later

fetch('data/servants.json')
  .then(response => response.json())
  .then(data => {
    allServants = data;
    renderGrid(allServants);
  });

function renderGrid(servants) {
  const grid = document.getElementById('cardsGrid');
  grid.innerHTML = '';   // clears it first, so re-filtering later won't duplicate cards

  servants.forEach((servant) => {
    const slot = document.createElement('div');
    slot.classList.add('servant-card-slot');

    const img = document.createElement('img');
    img.classList.add('servant-card');
    img.src = `images/Servants/${servant.servant_id}/Archetype.webp`;
    img.alt = servant.servant_name;

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

  servant.skills.forEach((skill) => {
    const img = document.createElement('img');
    img.src = getSkillImagePath(servant, skill);
    img.alt = skill.skill_name;
    skillsContainer.appendChild(img);
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