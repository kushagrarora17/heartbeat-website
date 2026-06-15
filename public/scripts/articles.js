document.addEventListener("DOMContentLoaded", function () {
  const categoryFilter = document.getElementById("category-filter");
  const sortFilter = document.getElementById("sort-filter");
  const searchInput = document.getElementById("search-input");
  const articlesGrid = document.getElementById("articles-grid");
  const noResults = document.getElementById("no-results");

  if (
    !categoryFilter ||
    !sortFilter ||
    !searchInput ||
    !articlesGrid ||
    !noResults
  ) {
    return;
  }

  function filterAndSortArticles() {
    const categoryValue = categoryFilter.value;
    const sortValue = sortFilter.value;
    const searchValue = searchInput.value.toLowerCase();

    const articleCards = Array.from(document.querySelectorAll(".article-card"));
    const visibleCards = [];

    articleCards.forEach((card) => {
      const cardCategory = card.dataset.category;
      const cardTitle = card.dataset.title;
      const cardExcerpt = card.dataset.excerpt;
      const cardAuthor = card.dataset.author;

      const categoryMatch =
        categoryValue === "all" || cardCategory === categoryValue;
      const searchMatch =
        searchValue === "" ||
        cardTitle?.includes(searchValue) ||
        cardExcerpt?.includes(searchValue) ||
        cardAuthor?.includes(searchValue);

      if (categoryMatch && searchMatch) {
        card.style.display = "block";
        visibleCards.push(card);
      } else {
        card.style.display = "none";
      }
    });

    visibleCards.sort((a, b) => {
      switch (sortValue) {
        case "newest": {
          const dateA = a.dataset.date ? new Date(a.dataset.date).getTime() : 0;
          const dateB = b.dataset.date ? new Date(b.dataset.date).getTime() : 0;
          return dateB - dateA;
        }
        case "oldest": {
          const dateA = a.dataset.date ? new Date(a.dataset.date).getTime() : 0;
          const dateB = b.dataset.date ? new Date(b.dataset.date).getTime() : 0;
          return dateA - dateB;
        }
        case "title":
          return (a.dataset.title || "").localeCompare(b.dataset.title || "");
        case "read-time": {
          const getReadTime = (el) => {
            const match = (el.dataset.readTime || "").match(/^(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
          };
          return getReadTime(a) - getReadTime(b);
        }
        default:
          return 0;
      }
    });

    visibleCards.forEach((card) => articlesGrid.appendChild(card));

    if (visibleCards.length === 0) {
      articlesGrid.style.display = "none";
      noResults.classList.remove("hidden");
    } else {
      articlesGrid.style.display = "grid";
      noResults.classList.add("hidden");
    }
  }

  categoryFilter.addEventListener("change", filterAndSortArticles);
  sortFilter.addEventListener("change", filterAndSortArticles);
  searchInput.addEventListener("input", filterAndSortArticles);

  const newsletterForm = document.querySelector('form[name="newsletter"]');
  newsletterForm?.addEventListener("submit", function (event) {
    event.preventDefault();
    const emailInput = this.querySelector('input[type="email"]');

    if (!emailInput) {
      return;
    }

    alert(`Thank you for subscribing with email: ${emailInput.value}`);
    this.reset();
  });
});
