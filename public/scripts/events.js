document.addEventListener("DOMContentLoaded", function () {
  const categoryFilter = document.getElementById("category-filter");
  const levelFilter = document.getElementById("level-filter");
  const searchInput = document.getElementById("search-input");
  const eventsGrid = document.getElementById("events-grid");
  const noResults = document.getElementById("no-results");

  if (!categoryFilter || !levelFilter || !searchInput || !eventsGrid || !noResults) {
    return;
  }

  function filterEvents() {
    const categoryValue = categoryFilter.value;
    const levelValue = levelFilter.value;
    const searchValue = searchInput.value.toLowerCase();

    const eventCards = document.querySelectorAll(".event-card");
    let visibleCount = 0;

    eventCards.forEach((card) => {
      const cardCategory = card.dataset.category;
      const cardLevel = card.dataset.level;
      const cardTitle = card.dataset.title;
      const cardDescription = card.dataset.description;

      const categoryMatch =
        categoryValue === "all" || cardCategory === categoryValue;
      const levelMatch =
        levelValue === "all" || cardLevel === levelValue || cardLevel === "all";
      const searchMatch =
        searchValue === "" ||
        cardTitle?.includes(searchValue) ||
        cardDescription?.includes(searchValue);

      if (categoryMatch && levelMatch && searchMatch) {
        card.style.display = "block";
        visibleCount += 1;
      } else {
        card.style.display = "none";
      }
    });

    if (visibleCount === 0) {
      eventsGrid.style.display = "none";
      noResults.classList.remove("hidden");
    } else {
      eventsGrid.style.display = "grid";
      noResults.classList.add("hidden");
    }
  }

  categoryFilter.addEventListener("change", filterEvents);
  levelFilter.addEventListener("change", filterEvents);
  searchInput.addEventListener("input", filterEvents);
});
