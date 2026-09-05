```javascript
/* =========================================================
   EDUCATION POINT — MAIN JAVASCRIPT
   ========================================================= */

const SUPABASE_URL =
  "https://zpvqgrqgxckzxkoygeqo.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_Fm2B3h3_qyVMKcGc_CABcA_FU0ptpud";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =========================================================
   HELPERS
   ========================================================= */

function escapeText(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function getMaterialTypeIcon(type) {

  const value =
    String(type || "").toLowerCase();

  if (value.includes("question")) return "📝";
  if (value.includes("note")) return "📚";
  if (value.includes("worksheet")) return "📋";
  if (value.includes("important")) return "🎯";
  if (value.includes("video")) return "🎥";

  return "📄";
}


/* =========================================================
   DARK MODE
   ========================================================= */

function setupTheme() {

  const themeBtn =
    document.getElementById("themeBtn");

  if (!themeBtn) return;

  const savedTheme =
    localStorage.getItem("educationPointTheme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeBtn.textContent = "☀️";
  } else {
    document.body.classList.remove("dark");
    themeBtn.textContent = "🌙";
  }


  themeBtn.addEventListener("click", function () {

    document.body.classList.toggle("dark");

    const isDark =
      document.body.classList.contains("dark");

    themeBtn.textContent =
      isDark ? "☀️" : "🌙";

    localStorage.setItem(
      "educationPointTheme",
      isDark ? "dark" : "light"
    );

  });

}


/* =========================================================
   CREATE MATERIAL CARD
   ========================================================= */

function createMaterialCard(material) {

  const card =
    document.createElement("article");

  card.className = "material-box";


  const className =
    material.classes?.name ||
    material.class_name ||
    "";

  const subjectName =
    material.subjects?.name ||
    material.subject_name ||
    "";

  const materialType =
    material.material_type ||
    "PDF";

  const typeIcon =
    getMaterialTypeIcon(materialType);


  card.dataset.class =
    className;

  card.dataset.subject =
    subjectName;

  card.dataset.search =
    [
      material.title,
      material.chapter,
      material.description,
      className,
      subjectName,
      materialType
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();


  card.innerHTML = `

    <div class="material-card-top">

      <div class="material-icon">
        ${typeIcon}
      </div>

      <div class="material-type-badge">
        ${typeIcon}
        ${escapeText(materialType)}
      </div>

    </div>


    <div class="material-meta">

      🎓 ${escapeText(className)}

      <span>→</span>

      📚 ${escapeText(subjectName)}

    </div>


    <h3>
      ${escapeText(
        material.title || "Study Material"
      )}
    </h3>


    ${
      material.chapter
        ? `
          <div class="material-chapter">
            📖
            <span>
              ${escapeText(material.chapter)}
            </span>
          </div>
        `
        : ""
    }


    ${
      material.description
        ? `
          <p>
            ${escapeText(material.description)}
          </p>
        `
        : ""
    }

    ${
      material.material_type === "Question Paper" &&
      material.preview_url
        ? `
          <img
            src="${escapeText(material.preview_url)}"
            alt="Question Paper Preview"
            style="width:100%; max-height:300px; object-fit:contain; border-radius:12px; margin:12px 0; cursor:pointer;"
            onclick="window.open('${escapeText(material.preview_url)}', '_blank')"
          >
        `
        : ""
    }
    <div class="material-buttons">

      ${
        material.file_url
          ? `
            <a
              class="material-btn pdf-btn"
              href="${escapeText(material.file_url)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              📥 Open PDF
            </a>
          `
          : ""
      }


      ${
        material.youtube_url
          ? `
            <a
              class="material-btn video-btn"
              href="${escapeText(material.youtube_url)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              ▶ Watch Video
            </a>
          `
          : ""
      }

    </div>

  `;


  return card;
}


/* =========================================================
   LOAD ALL MATERIALS
   ========================================================= */

async function loadLiveMaterials() {

  const container =
    document.getElementById("liveMaterials");

  if (!container) return;


  container.innerHTML = `
    <div class="material-loading">
      <div>⏳</div>
      <p>Loading study materials...</p>
    </div>
  `;


  const {
    data,
    error
  } = await supabaseClient

    .from("materials")

    .select(`
      id,
      title,
      chapter,
      material_type,
      file_url,
      youtube_url,
      preview_url,
      description,
      created_at,
      class_id,
      subject_id,
      classes(name),
      subjects(name)
    `)

    .order(
      "created_at",
      {
        ascending: false
      }
    );


  if (error) {

    console.error(
      "loadLiveMaterials error:",
      error
    );

    container.innerHTML = `
      <div class="material-box error-box">

        <h3>
          ❌ Materials load nahi ho pa rahe
        </h3>

        <p>
          ${escapeText(error.message)}
        </p>

      </div>
    `;

    return;
  }


  if (!data || data.length === 0) {

    container.innerHTML = `
      <div class="material-box empty-box">

        <div class="empty-icon">
          📚
        </div>

        <h3>
          No materials yet
        </h3>

        <p>
          Study materials jaldi add kiye jayenge.
        </p>

      </div>
    `;

    return;
  }


  container.innerHTML = "";


  data.forEach(material => {

    container.appendChild(
      createMaterialCard(material)
    );

  });


  applyFilters();

}


/* =========================================================
   SHOW SUBJECT MATERIALS
   ========================================================= */

async function showSubjectMaterials(
  className,
  subjectName
) {

  const section =
    document.getElementById(
      "subjectMaterials"
    );

  const selectedClass =
    document.getElementById(
      "selectedClass"
    );

  const selectedSubject =
    document.getElementById(
      "selectedSubject"
    );

  const list =
    document.getElementById(
      "subjectMaterialsList"
    );


  if (
    !section ||
    !selectedClass ||
    !selectedSubject ||
    !list
  ) {

    console.error(
      "Subject materials elements missing."
    );

    return;
  }


  /* Show section */

  section.style.display = "block";


  /* Set heading */

  selectedClass.textContent =
    className.toUpperCase();

  selectedSubject.textContent =
    subjectName;


  /* Loading */

  list.innerHTML = `
    <div class="material-box">

      <div class="material-loading">
        <div>⏳</div>

        <h3>
          Loading ${escapeText(subjectName)}...
        </h3>

        <p>
          ${escapeText(className)}
          →
          ${escapeText(subjectName)}
        </p>

      </div>

    </div>
  `;


  /* Scroll */

  setTimeout(() => {

    section.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }, 50);


  /*
   * IMPORTANT:
   *
   * We first find class ID and subject ID.
   * Then we query materials using IDs.
   *
   * This is more reliable than filtering
   * nested table names directly.
   */


  /* =======================================================
     FIND CLASS
     ======================================================= */

  const {
    data: classData,
    error: classError
  } = await supabaseClient

    .from("classes")

    .select("id,name")

    .eq("name", className)

    .limit(1);


  if (classError) {

    console.error(
      "Class lookup error:",
      classError
    );

    list.innerHTML = `
      <div class="material-box error-box">

        <h3>
          ❌ Class load nahi ho pa rahi
        </h3>

        <p>
          ${escapeText(classError.message)}
        </p>

      </div>
    `;

    return;
  }


  if (!classData || classData.length === 0) {

    list.innerHTML = `
      <div class="material-box empty-box">

        <div class="empty-icon">
          🔍
        </div>

        <h3>
          Class nahi mili
        </h3>

        <p>
          ${escapeText(className)}
        </p>

      </div>
    `;

    return;
  }


  const classId =
    classData[0].id;


  /* =======================================================
     FIND SUBJECT
     ======================================================= */

  const {
    data: subjectData,
    error: subjectError
  } = await supabaseClient

    .from("subjects")

    .select("id,name,class_id")

    .eq("name", subjectName)

    .eq("class_id", classId)

    .limit(1);


  if (subjectError) {

    console.error(
      "Subject lookup error:",
      subjectError
    );

    list.innerHTML = `
      <div class="material-box error-box">

        <h3>
          ❌ Subject load nahi ho raha
        </h3>

        <p>
          ${escapeText(subjectError.message)}
        </p>

      </div>
    `;

    return;
  }


  if (
    !subjectData ||
    subjectData.length === 0
  ) {

    list.innerHTML = `
      <div class="material-box empty-box">

        <div class="empty-icon">
          🔬
        </div>

        <h3>
          ${escapeText(subjectName)} ke materials nahi mile
        </h3>

        <p>
          ${escapeText(className)}
          →
          ${escapeText(subjectName)}
        </p>

      </div>
    `;

    return;
  }


  const subjectId =
    subjectData[0].id;


  /* =======================================================
     LOAD MATERIALS USING IDs
     ======================================================= */

  const {
    data: materials,
    error: materialsError
  } = await supabaseClient

    .from("materials")

    .select(`
      id,
      title,
      chapter,
      material_type,
      file_url,
      preview_url,
      youtube_url,
      description,
      created_at,
      class_id,
      subject_id,
      classes(name),
      subjects(name)
    `)

    .eq("class_id", classId)

    .eq("subject_id", subjectId)

    .order(
      "created_at",
      {
        ascending: false
      }
    );


  if (materialsError) {

    console.error(
      "Materials query error:",
      materialsError
    );

    list.innerHTML = `
      <div class="material-box error-box">

        <h3>
          ❌ Materials load nahi ho pa rahe
        </h3>

        <p>
          ${escapeText(materialsError.message)}
        </p>

      </div>
    `;

    return;
  }


  /* =======================================================
     NO MATERIALS
     ======================================================= */

  if (
    !materials ||
    materials.length === 0
  ) {

    list.innerHTML = `
      <div class="material-box empty-box">

        <div class="empty-icon">
          📚
        </div>

        <h3>
          Abhi materials available nahi hain
        </h3>

        <p>
          ${escapeText(className)}
          →
          ${escapeText(subjectName)}
        </p>

        <small>
          Admin panel se material upload hone ke baad
          yahan automatically show hoga.
        </small>

      </div>
    `;

    return;
  }


  /* =======================================================
     DISPLAY MATERIALS
     ======================================================= */

  list.innerHTML = "";


  materials.forEach(material => {

    list.appendChild(
      createMaterialCard(material)
    );

  });

}


/* =========================================================
   FILTER SYSTEM
   ========================================================= */

function applyFilters() {

  const searchInput =
    document.getElementById(
      "materialSearch"
    );

  const classFilter =
    document.getElementById(
      "classFilter"
    );

  const subjectFilter =
    document.getElementById(
      "subjectFilter"
    );


  const search =
    searchInput?.value
      .toLowerCase()
      .trim() || "";


  const selectedClass =
    classFilter?.value || "";


  const selectedSubject =
    subjectFilter?.value || "";


  const cards =
    document.querySelectorAll(
      "#liveMaterials .material-box"
    );


  let visibleCount = 0;


  cards.forEach(card => {

    const text =
      card.dataset.search ||
      card.textContent
        .toLowerCase();


    const cardClass =
      card.dataset.class || "";


    const cardSubject =
      card.dataset.subject || "";


    const searchMatch =
      !search ||
      text.includes(search);


    const classMatch =
      !selectedClass ||
      cardClass === selectedClass;


    const subjectMatch =
      !selectedSubject ||
      cardSubject === selectedSubject;


    const visible =
      searchMatch &&
      classMatch &&
      subjectMatch;


    card.style.display =
      visible ? "" : "none";


    if (visible) {
      visibleCount++;
    }

  });


  const container =
    document.getElementById(
      "liveMaterials"
    );


  if (
    container &&
    cards.length > 0 &&
    visibleCount === 0
  ) {

    let noResult =
      document.getElementById(
        "noFilterResults"
      );


    if (!noResult) {

      noResult =
        document.createElement("div");

      noResult.id =
        "noFilterResults";

      noResult.className =
        "material-box empty-box";

      noResult.innerHTML = `
        <div class="empty-icon">
          🔍
        </div>

        <h3>
          No materials found
        </h3>

        <p>
          Search/filter change karke try karo.
        </p>
      `;

      container.appendChild(
        noResult
      );

    }

  } else {

    document
      .getElementById(
        "noFilterResults"
      )
      ?.remove();

  }

}


/* =========================================================
   FILTER EVENTS
   ========================================================= */

function setupFilters() {

  document
    .getElementById("materialSearch")
    ?.addEventListener(
      "input",
      applyFilters
    );


  document
    .getElementById("classFilter")
    ?.addEventListener(
      "change",
      applyFilters
    );


  document
    .getElementById("subjectFilter")
    ?.addEventListener(
      "change",
      applyFilters
    );

}


/* =========================================================
   SMOOTH NAVIGATION
   ========================================================= */

function setupNavigation() {

  document
    .querySelectorAll(
      'a[href^="#"]'
    )
    .forEach(link => {

      link.addEventListener(
        "click",
        function(event) {

          const targetId =
            this.getAttribute("href");


          if (
            !targetId ||
            targetId === "#"
          ) {
            return;
          }


          const target =
            document.querySelector(
              targetId
            );


          if (!target) {
            return;
          }


          event.preventDefault();


          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        }
      );

    });

}


/* =========================================================
   SUBJECT CARD ACCESSIBILITY
   ========================================================= */

function setupSubjectCards() {

  document
    .querySelectorAll(
      ".subject-card"
    )
    .forEach(card => {

      card.setAttribute(
        "role",
        "button"
      );

      card.setAttribute(
        "tabindex",
        "0"
      );


      card.addEventListener(
        "keydown",
        function(event) {

          if (
            event.key === "Enter" ||
            event.key === " "
          ) {

            event.preventDefault();

            card.click();

          }

        }
      );

    });

}


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    console.log(
      "🎓 Education Point loaded"
    );


    setupTheme();

    setupFilters();

    setupNavigation();

    setupSubjectCards();


    await loadLiveMaterials();

  }
);


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.showSubjectMaterials =
  showSubjectMaterials;

window.loadLiveMaterials =
  loadLiveMaterials;

window.applyFilters =
  applyFilters;
```
window.showSubjectMaterials =
  showSubjectMaterials;

window.loadLiveMaterials =
  loadLiveMaterials;

window.applyFilters =
  applyFilters;
/* =========================================================
   EVERYTHING YOU NEED — RESOURCE CARDS
   ========================================================= */

function activateResource(type) {

  const liveSection =
    document.getElementById("live-materials");

  const searchInput =
    document.getElementById("materialSearch");

  const classFilter =
    document.getElementById("classFilter");

  const subjectFilter =
    document.getElementById("subjectFilter");

  if (!liveSection) {
    console.error("Live materials section not found.");
    return;
  }

  // Clear class and subject filters
  if (classFilter) {
    classFilter.value = "";
  }

  if (subjectFilter) {
    subjectFilter.value = "";
  }

  // Set search according to selected resource
  const searches = {
    notes: "note",
    questions: "question",
    pdfs: "pdf",
    important: "important"
  };

  if (searchInput) {
    searchInput.value =
      searches[type] || "";
  }

  // Apply existing filter system
  applyFilters();

  // Scroll to study materials
  liveSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

/* Make function available to index.html */
window.activateResource =
  activateResource;
