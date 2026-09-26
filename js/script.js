const DATA_PATH = 'data/';

const state = {
  site: null,
  council: null,
  clans: [],
  people: [],
  lineages: null,
  locations: []
};

const esc = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const byId = id => document.getElementById(id);

async function loadData() {
  const files = ['site.json','council.json','clans.json','people.json','lineages.json','locations.json'];
  const values = await Promise.all(files.map(file => fetch(DATA_PATH + file).then(r => {
    if (!r.ok) throw new Error(`Não foi possível carregar ${file}`);
    return r.json();
  })));
  [state.site, state.council, state.clans, state.people, state.lineages, state.locations] = values;
}

function renderNav() {
  byId('main-nav').innerHTML = [
    ['consilium', 'Consilium'],
    ['clans', 'Clãs'],
    ['personagens', 'Personagens'],
    ['linhagens', 'Linhagens']
  ]
    .map(([id, label]) => `<a href="#${id}">${label}</a>`)
    .join('');
}

function renderHero() {
  byId('hero-lead').textContent = state.site.heroLead;
  byId('hero-quote').textContent = state.site.heroQuote;

  byId('notice-title').textContent = state.site.noticeTitle;
  byId('notice-text').textContent = state.site.noticeText;
}

function sectionHead(item) {
  return `<div class="section-head"><div><span class="eyebrow">${esc(item.eyebrow)}</span><h2>${esc(item.title)}</h2></div><span class="section-number">${esc(item.number)}</span></div>`;
}

function renderCouncil() {
  const c = state.council;

  const cards = c.seats.map(seat => {

    const person = seat.personId
      ? personById(seat.personId)
      : null;

    const responsibilities = (seat.responsibilities || [])
      .map(item => `
        <li>
          <span class="responsibility-symbol">·</span>
          <span>${esc(item)}</span>
        </li>
      `)
      .join('');

    const clan = person?.clan
      ? state.clans.find(clan => clan.id === person.clan)
      : null;

    return `
      <article
        class="person-card ${seat.featured ? 'featured' : ''} ${seat.empty ? 'unknown' : ''}"
        ${seat.personId ? `data-person-id="${esc(seat.personId)}"` : ''}
      >

        <div class="seat-header">
          <span class="seat-symbol">${esc(seat.symbol || '')}</span>
          <span class="rank">${esc(seat.name)}</span>
        </div>

        ${
          person
            ? `
              <h3>${esc(person.name)}</h3>

              <p class="clan">
                ${esc(clan?.name || person.clan)}
              </p>
            `
            : `
              <h3>Cadeira não ocupada</h3>
            `
        }

        ${
          seat.title
            ? `<p class="seat-title">${esc(seat.title)}</p>`
            : ''
        }

        ${
          seat.description
            ? `<p>${esc(seat.description)}</p>`
            : ''
        }

        <div class="seat-details">

          ${
            responsibilities
              ? `
                <div class="seat-responsibilities">
                  <strong>RESPONSABILIDADES</strong>
                  <ul>
                    ${responsibilities}
                  </ul>
                </div>
              `
              : ''
          }

          ${
            seat.principle
              ? `
                <blockquote>
                  ${esc(seat.principle)}
                </blockquote>
              `
              : ''
          }

        </div>

      </article>
    `;
  }).join('');

  return `
    <section id="consilium" class="section">
      ${sectionHead(c)}

      <p class="intro">${esc(c.intro)}</p>

      <div class="council-grid">
        ${cards}
      </div>
    </section>
  `;
}

function renderClans() {
  return `<section id="clans" class="section dark-section">
    ${sectionHead({
      eyebrow: 'AS GRANDES LINHAGENS',
      title: 'Clãs de Roma',
      number: 'II'
    })}

    <div class="clan-grid">
      ${state.clans.map(clan => {

        const characterCount = state.people.filter(
          person => person.clan === clan.id
        ).length;

        return `
          <article 
            class="clan-card ${clan.outside ? 'outside' : ''}" 
            data-clan-id="${esc(clan.id)}"
          >
            <div class="clan-symbol">
              <img 
                src="img/${esc(clan.img)}" 
                alt="Símbolo do clã ${esc(clan.name)}"
              >
            </div>

            <h3>${esc(clan.name)}</h3>

            <p>${esc(clan.description)}</p>

            <small>
              ${characterCount} ${characterCount === 1 ? 'Cainita conhecido' : 'Cainitas conhecidos'}
            </small>
          </article>
        `;
      }).join('')}
    </div>
  </section>`;
}

function renderPeople() {

  const ageOrder = ['Matuselah', 'Elder', 'Ancilla', 'Neonate'];

  const ageLabels = {
    Matuselah: 'Matuselahs',
    Elder: 'Elders',
    Ancilla: 'Ancillaes',
    Neonate: 'Neonatos'
  };

  const renderCard = person => {
    const portrait = person.img
      ? `
        <div class="npc-avatar">
          <img
            src="img/${esc(person.img)}"
            alt="Retrato de ${esc(person.name)}"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          >
          <div class="npc-avatar-fallback" style="display:none;">
            ${esc(person.initials)}
          </div>
        </div>
      `
      : `
        <div class="npc-avatar npc-avatar-fallback">
          ${esc(person.initials)}
        </div>
      `;

    const classes = [
      'npc',
      person.isNPC === false ? 'player-character' : '',
      person.wasPresented === false ? 'unpresented' : ''
    ].filter(Boolean).join(' ');

    return `
      <article
        class="${classes}"
        data-name="${esc(person.name)}"
        data-clan="${esc(person.clan)}"
        data-person-id="${esc(person.id)}"
      >
        ${person.isNPC === false ? '<span class="blood-splatter blood-1"></span><span class="blood-splatter blood-2"></span>' : ''}

        ${portrait}

        <div>
          <span>
            ${esc(person.clan.toUpperCase())} · ${esc(person.role.toUpperCase())}
          </span>

          <h3>${esc(person.name)}</h3>

          <p>${esc(person.summary)}</p>
        </div>
      </article>
    `;
  };

  const groups = ageOrder
    .map(age => {
      const people = state.people
        .filter(person => person.age === age)
        .map(renderCard)
        .join('');

      if (!people) return '';

      return `
        <div class="age-group" data-age="${esc(age)}">
          <div class="age-divider">
            <span>${esc(ageLabels[age])}</span>
          </div>

          <div class="people-grid age-people">
            ${people}
          </div>
        </div>
      `;
    })
    .join('');

  return `
    <section id="personagens" class="section">
      ${sectionHead({
        eyebrow: 'NOMES CONHECIDOS',
        title: 'Personagens',
        number: 'III'
      })}

      <div class="toolbar">
        <input
          id="search"
          type="search"
          placeholder="Buscar por nome, clã ou função…"
        >

        <div class="clan-tabs" id="clan-tabs">
          <button class="clan-tab active" data-clan="all">
            Todos
          </button>

          ${state.clans
            .filter(clan => clan.id !== 'gangrel')
            .map(clan => `
              <button
                class="clan-tab"
                data-clan="${esc(clan.id)}"
              >
                ${esc(clan.name)}
              </button>
            `)
            .join('')}
        </div>
      </div>

      <div id="people">
        ${groups}
      </div>

      <p id="empty-people" class="empty-state" hidden>
        Nenhum personagem corresponde à busca.
      </p>
    </section>
  `;
}
function renderLineageNode(personId, visited = new Set()) {
  const person = personById(personId);

  if (!person || visited.has(person.id)) {
    return '';
  }

  const nextVisited = new Set(visited);
  nextVisited.add(person.id);

  const descendants = (person.descendantIds || [])
    .map(id => personById(id))
    .filter(Boolean);

  const childrenClass =
    descendants.length > 1
      ? 'multiple-children'
      : 'single-child';

  return `
    <div class="lineage-node-group">

      <button
        class="node ${clanClass(person.clan)}-node"
        data-person-id="${esc(person.id)}"
        type="button"
      >
        <small>
          ${esc(person.clan.toUpperCase())} · ${esc(person.age.toUpperCase())}
        </small>

        <strong>
          ${esc(person.name)}
        </strong>

        <span class="lineage-role">
          ${esc(person.role)}
        </span>
      </button>

      ${
        descendants.length
          ? `
            <div class="lineage-connector"></div>

            <div class="lineage-children ${childrenClass}">
              ${descendants
                .map(child =>
                  renderLineageNode(child.id, nextVisited)
                )
                .join('')}
            </div>
          `
          : ''
      }

    </div>
  `;
}


function getLineageRoots() {
  return state.people.filter(person => {
    if (!person.sireId) return true;

    return !personById(person.sireId);
  });
}


function renderLineages() {
  const roots = getLineageRoots();

  /*
   * Agrupa as raízes pelo clã.
   *
   * Exemplo:
   *
   * Ventrue
   *   ├── Aulus
   *   └── Gneus
   *
   * Lasombra
   *   ├── Octavius
   *   └── Santa
   */
  const clans = {};

  roots.forEach(person => {
    if (!clans[person.clan]) {
      clans[person.clan] = [];
    }

    clans[person.clan].push(person);
  });

  /*
   * Mantém a ordem dos clãs definida em clans.json.
   * Clãs que eventualmente não estejam no arquivo
   * ainda são adicionados ao final.
   */
  const orderedClanIds = [
    ...state.clans
      .map(clan => clan.id)
      .filter(id => clans[id]),

    ...Object.keys(clans)
      .filter(id => !state.clans.some(clan => clan.id === id))
  ];

  const clanSections = orderedClanIds
    .map(clanId => {
      const clan = state.clans.find(c => c.id === clanId);
      const clanName = clan?.name || clanId;

      const families = clans[clanId];

      return `
        <div class="lineage-clan">

          <div class="lineage-clan-title">
            <span>${esc(clanName)}</span>
          </div>

          <div class="lineage-families">

            ${families
              .map((root, index) => `
                <div class="lineage-family">

                  ${index > 0
                    ? `<div class="lineage-family-divider"></div>`
                    : ''
                  }

                  ${renderLineageNode(root.id)}

                </div>
              `)
              .join('')}

          </div>

        </div>
      `;
    })
    .join('');

  return `
    <section id="linhagens" class="section parchment">

      ${sectionHead({
        eyebrow: 'SANGUE E DESCENDÊNCIA',
        title: 'Árvore de linhagens',
        number: 'IV'
      })}

      <p class="intro">
        ${esc(state.lineages.intro)}
      </p>

      <div class="lineage-trees">
        ${clanSections}
      </div>

      <div class="footnote">
        ${esc(state.lineages.footnote)}
      </div>

    </section>
  `;
}
function renderRome() {
  return `<section id="roma" class="section dark-section">
    ${sectionHead({eyebrow:'A CIDADE',title:'Roma Nocturna',number:'V'})}
    <div class="rome-grid">${state.locations.map(loc => `<article><span class="icon">${esc(loc.icon)}</span><h3>${esc(loc.title)}</h3><p>${esc(loc.description)}</p></article>`).join('')}</div>
  </section>`;
}

function renderClosing() {
  return `<section class="closing"><div class="sigil">SPQR</div><p>${esc(state.site.closingQuote)}</p><small>${esc(state.site.closingSmall)}</small></section>`;
}

function renderAll() {
  renderNav();
  renderHero();
  // ${renderRome()}
  byId('content').innerHTML = `
    ${renderCouncil()}
    ${renderClans()}
    ${renderPeople()}
    ${renderLineages()}

    ${renderClosing()}
  `;

  bindInteractions();
  bindCodexIntro();
}

function bindCodexIntro() {
  const hero = byId('inicio');
  const notice = byId('codex-notice');
  const content = byId('content');
  const header = byId('site-header');
  const enterButton = hero?.querySelector('.button');

  if (!hero || !content || !enterButton) return;

  header?.classList.add('codex-hidden');

  enterButton.addEventListener('click', event => {
    event.preventDefault();

    // Inicia a saída da tela de abertura
    hero.classList.add('hero-exit');
    notice?.classList.add('notice-exit');

    setTimeout(() => {
      // Remove completamente a tela inicial
      hero.remove();
      notice?.remove();

      // Mostra o Codex
      header?.classList.remove('codex-hidden');
      content.classList.add('codex-visible');

      // Posiciona no início do Codex
      document.getElementById('consilium')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 700);
  });
}
function personById(id) { return state.people.find(p => p.id === id); }
function clanClass(clan) { return clan.toLowerCase().replace(/[^a-z0-9]/g, ''); }

function showPerson(personId) {
  const person = personById(personId);
  if (!person) return;

  const clan = state.clans.find(c => c.id === person.clan);

  const details = person.details
    ? person.details
        .split("\n\n")
        .map(paragraph => `<p>${esc(paragraph)}</p>`)
        .join('')
    : `<p>${esc(person.summary || '')}</p>`;

  // ─────────────────────────────────────
  // Senhor (Sire)
  // ─────────────────────────────────────

  const sire = person.sireId
    ? personById(person.sireId)
    : null;

  const sireHtml = sire
    ? `
      <div class="genealogy-section">
        <span class="genealogy-label">Senhor</span>

        <button
          class="genealogy-person"
          data-person-id="${esc(sire.id)}"
          type="button"
        >
          <span class="genealogy-name">
            ${esc(sire.name)}
          </span>

          <span class="genealogy-meta">
            ${esc(sire.clan.toUpperCase())} · ${esc(sire.role)}
          </span>
        </button>
      </div>
    `
    : '';

  // ─────────────────────────────────────
  // Descendentes
  // ─────────────────────────────────────

  const descendants = (person.descendantIds || [])
    .map(id => personById(id))
    .filter(Boolean);

  const descendantsHtml = descendants.length
    ? `
      <div class="genealogy-section">
        <span class="genealogy-label">
          Descendentes
        </span>

        <div class="genealogy-list">
          ${descendants
            .map(descendant => `
              <button
                class="genealogy-person"
                data-person-id="${esc(descendant.id)}"
                type="button"
              >
                <span class="genealogy-name">
                  ${esc(descendant.name)}
                </span>

                <span class="genealogy-meta">
                  ${esc(descendant.clan.toUpperCase())} · ${esc(descendant.role)}
                </span>
              </button>
            `)
            .join('')}
        </div>
      </div>
    `
    : '';

  // Só exibe a divisão de linhagem se houver
  // sire ou descendentes conhecidos.
  const genealogyHtml = sireHtml || descendantsHtml
    ? `
      <div class="person-genealogy">
        <div class="genealogy-divider">
          <span>Linhagem</span>
        </div>

        ${sireHtml}
        ${descendantsHtml}
      </div>
    `
    : '';

  // ─────────────────────────────────────
  // Retrato
  // ─────────────────────────────────────

  const image = person.img
    ? `
      <div class="person-portrait">
        <img
          src="img/${esc(person.img)}"
          alt="Retrato de ${esc(person.name)}"
          onerror="
            this.parentElement.classList.add('portrait-error');
            this.style.display='none';
          "
        >
      </div>
    `
    : `
      <div class="person-portrait avatar ${clanClass(person.clan)}">
        ${esc(person.initials)}
      </div>
    `;

  // ─────────────────────────────────────
  // Modal
  // ─────────────────────────────────────

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';

  modal.innerHTML = `
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-label="${esc(person.name)}"
    >

      <button
        class="modal-close"
        aria-label="Fechar"
      >
        ×
      </button>

      <div class="modal-avatar avatar ${clanClass(person.clan)}">
        ${
          clan?.img
            ? `
              <img
                src="img/${esc(clan.img)}"
                alt="Símbolo do clã ${esc(clan.name)}"
              >
            `
            : esc(person.initials)
        }
      </div>

      <span class="modal-kicker">
        ${esc(person.clan.toUpperCase())}
        ·
        ${esc(person.role.toUpperCase())}
      </span>

      <h2>${esc(person.name)}</h2>

      ${image}

      <div class="person-details">
        ${details}
      </div>

      ${genealogyHtml}

    </div>
  `;

  document.body.appendChild(modal);

  // ─────────────────────────────────────
  // Fechar
  // ─────────────────────────────────────

  const close = () => {
    modal.remove();
  };

  modal
    .querySelector('.modal-close')
    .addEventListener('click', close);

  modal.addEventListener('click', e => {
    if (e.target === modal) {
      close();
    }
  });

  // ─────────────────────────────────────
  // Abrir personagem da genealogia
  // ─────────────────────────────────────

  modal
    .querySelectorAll('.genealogy-person')
    .forEach(button => {
      button.addEventListener('click', () => {
        const targetId = button.dataset.personId;

        close();
        showPerson(targetId);
      });
    });

  // ─────────────────────────────────────
  // ESC
  // ─────────────────────────────────────

  document.addEventListener('keydown', function escClose(e) {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', escClose);
    }
  });
}
function applyFilters() {
  const search = byId('search');
  const tabs = document.querySelectorAll('.clan-tab');

  if (!search || !tabs.length) return;

  const q = search.value.toLowerCase().trim();

  const activeTab = document.querySelector('.clan-tab.active');
  const f = activeTab?.dataset.clan || 'all';

  let visible = 0;

  document.querySelectorAll('.npc').forEach(card => {
    const person = personById(card.dataset.personId);
    if (!person) return;

    const haystack = `
      ${person.name}
      ${person.clan}
      ${person.role}
      ${person.summary}
    `.toLowerCase();

    const ok =
      (!q || haystack.includes(q)) &&
      (f === 'all' || person.clan === f);

    card.hidden = !ok;

    if (ok) visible++;
  });

  /*
   * Esconde também os grupos de idade que ficaram vazios.
   */
  document.querySelectorAll('.age-group').forEach(group => {
    const hasVisibleCard = [...group.querySelectorAll('.npc')]
      .some(card => !card.hidden);

    group.hidden = !hasVisibleCard;
  });

  byId('empty-people').hidden = visible !== 0;
}

function bindInteractions() {
  byId('search')?.addEventListener('input', applyFilters);
  byId('filter')?.addEventListener('change', applyFilters);
  document.querySelectorAll('.clan-tab').forEach(tab => {
  tab.addEventListener('click', () => {

      document.querySelectorAll('.clan-tab')
        .forEach(item => item.classList.remove('active'));

      tab.classList.add('active');

      applyFilters();
    });
  });
  document.querySelectorAll('[data-person-id]').forEach(el => el.addEventListener('click', () => showPerson(el.dataset.personId)));
  document.querySelectorAll('.clan-card').forEach(card => card.addEventListener('click', () => {
    const clan = state.clans.find(c => c.id === card.dataset.clanId);
    if (!clan) return;
    const filter = byId('filter');
    if (filter) { filter.value = clan.name; applyFilters(); document.getElementById('personagens')?.scrollIntoView({behavior:'smooth'}); }
  }));
  const menu = document.querySelector('.menu');
  menu?.addEventListener('click', () => document.querySelector('nav')?.classList.toggle('open'));
  document.querySelectorAll('#main-nav a').forEach(a => a.addEventListener('click', () => document.querySelector('nav')?.classList.remove('open')));
}

(async function init() {
  try {
    await loadData();
    renderAll();
  } catch (error) {
    console.error(error);
    byId('content').innerHTML = `<section class="section"><h2>O Codex não pôde ser carregado.</h2><p>Verifique se os arquivos da pasta <code>data/</code> foram publicados junto com o site.</p></section>`;
  }
})();
