document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".form-wizard");
  const progress = document.querySelector(".progress");
  const stepsContainer = document.querySelector(".steps-container");
  const steps = Array.from(document.querySelectorAll(".step"));
  const stepIndicators = Array.from(
    document.querySelectorAll(".progress-container li"),
  );
  const prevButton = document.querySelector(".prev-btn");
  const resetButton = document.querySelector(".reset-btn");
  const nextButton = document.querySelector(".next-btn");
  const submitButton = document.querySelector(".submit-btn");
  const reviewContent = document.getElementById("reviewContent");
  const formStatus = document.getElementById("formStatus");
  const lastStepIndex = stepIndicators.length - 1;

  const workLabels = {
    formal: "CLT (carteira assinada)",
    informal: "Informal/autônomo",
    mei: "MEI",
    desempregado: "Desempregado",
    aposentado: "Aposentado/Pensionista",
    nao_trabalha: "Não trabalha atualmente",
  };

  const rendaLabels = {
    extrema: "Até R$ 218",
    pobreza: "R$ 218 a R$ 435",
    meio: "Até 1/2 salário mínimo",
    "1sm": "1/2 a 1 salário mínimo",
    "2sm": "1 a 2 salários mínimos",
    "3sm": "2 a 3 salários mínimos",
    "4sm": "3 a 4 salários mínimos",
    acima: "Acima de 4 salários mínimos",
  };

  const genderLabels = {
    feminino: "Feminino",
    masculino: "Masculino",
  };

  const maritalLabels = {
    solteiro: "Solteiro(a)",
    casado: "Casado(a)",
    uniao: "União estável",
    separado: "Separado(a)",
    viuvo: "Viúvo(a)",
  };

  const moradiaLabels = {
    propria_escritura: "Própria (com escritura)",
    propria_financiada: "Própria (financiada)",
    alugada: "Alugada",
    cedida: "Cedida por terceiros",
    ocupada: "Ocupada",
    risco: "Em área de risco/invasão",
    rua: "Em situação de rua",
  };

  const yesNoLabels = {
    sim: "Sim",
    nao: "Não",
  };

  const cadunicoLabels = {
    sim: "Sim, estou cadastrado",
    nao: "Não estou cadastrado",
    nao_sei: "Não sei",
  };

  const doencaLabels = {
    cancer: "Câncer",
    hiv: "HIV/AIDS",
    renal: "Insuficiência renal",
    cardiaca: "Doença cardíaca grave",
    respiratoria: "Doença respiratória",
    outra: "Outra condição grave",
    nenhuma: "Nenhuma das anteriores",
  };

  const tipoDeficienciaLabels = {
    fisica: "Física/motora",
    visual: "Visual",
    auditiva: "Auditiva",
    intelectual: "Intelectual",
    mental: "Transtorno mental/psiquiátrico",
    multipla: "Múltipla",
  };

  const contribuicaoLabels = {
    menos6: "Menos de 6 meses",
    "6a12": "6 meses a 1 ano",
    "1a5": "1 a 5 anos",
    "5a10": "5 a 10 anos",
    "10a15": "10 a 15 anos",
    mais15: "Mais de 15 anos",
  };

  const desempregoLabels = {
    menos6: "Menos de 6 meses",
    "6a12": "6 a 12 meses",
    mais12: "Mais de 12 meses",
  };

  const draftStorageKey = "form-daniel-wizard-draft";
  const submissionsStorageKey = "form-daniel-submissions";
  const cpfInput = document.getElementById("cpf");
  const nameInput = document.getElementById("full-name");
  const agesInput = document.getElementById("idadesDependentes");

  if (agesInput) {
    agesInput.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData("text");
      const cleaned = text
        .replace(/[^\d, ]+/g, "")
        .replace(/\s*,\s*/g, ", ")
        .replace(/,+/g, ",")
        .replace(/^\s*,|,\s*$/g, "");
      document.execCommand("insertText", false, cleaned);
    });
  }

  document.documentElement.style.setProperty("--steps", stepIndicators.length);

  let currentStep = 0;

  const getFieldValue = (id) => document.getElementById(id)?.value || "";

  const getCheckedValue = (name) =>
    document.querySelector(`input[name="${name}"]:checked`)?.value || "";

  const resolveValue = (value, labels) => {
    if (!value) {
      return "Não informado";
    }

    return labels[value] || value;
  };

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const setFormStatus = (message, type = "info") => {
    if (!formStatus) {
      return;
    }

    formStatus.textContent = message;
    formStatus.style.color =
      type === "error" ? "#b00020" : type === "info" ? "#3056a3" : "#1a5f2b";
    formStatus.style.fontWeight = "600";
  };

  const readStoredSubmissions = () => {
    const storedSubmissions = localStorage.getItem(submissionsStorageKey);

    if (!storedSubmissions) {
      return [];
    }

    const parsedSubmissions = JSON.parse(storedSubmissions);
    return Array.isArray(parsedSubmissions) ? parsedSubmissions : [];
  };

  const saveStoredSubmissions = (submissions) => {
    localStorage.setItem(submissionsStorageKey, JSON.stringify(submissions));
  };

  const saveSubmission = (data) => {
    const submissions = readStoredSubmissions();
    const now = new Date().toISOString();
    const nextId =
      submissions.reduce((highestId, item) => {
        const numericId = Number(item.id);
        return Number.isFinite(numericId) && numericId > highestId
          ? numericId
          : highestId;
      }, 0) + 1;
    const existingIndex = submissions.findIndex(
      (item) => String(item.id) === String(data.id),
    );
    const previousSubmission =
      existingIndex >= 0 ? submissions[existingIndex] : {};
    const submission = {
      ...previousSubmission,
      ...data,
      id: data.id || previousSubmission.id || nextId,
      createdAt: previousSubmission.createdAt || now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      submissions[existingIndex] = submission;
    } else {
      submissions.push(submission);
    }

    saveStoredSubmissions(submissions);
    return submission;
  };

  const formatCpf = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 3) {
      return digits;
    }

    if (digits.length <= 6) {
      return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }

    if (digits.length <= 9) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    }

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
      6,
      9,
    )}-${digits.slice(9)}`;
  };

  const sanitizeName = (value) =>
    value.replace(/[^A-Za-zÀ-ÿ' -]/g, "").replace(/\s{2,}/g, " ");
  const validateStep = (stepIndex) => {
    const currentStepElement = steps[stepIndex];
    const controls = Array.from(
      currentStepElement.querySelectorAll("input, select, textarea"),
    ).filter((control) => !control.disabled);

    // Check individual controls (text, number, select, textarea)
    for (const control of controls) {
      const type = control.type;
      const isVisible = control.offsetParent !== null;

      if (!isVisible) continue;

      if (type === "radio" || type === "checkbox") continue;

      // If there's a pattern or it's a select, use built-in validity
      if (control.tagName === "SELECT" || control.hasAttribute("pattern")) {
        if (!control.checkValidity()) {
          control.reportValidity();
          control.focus();
          return false;
        }
        continue;
      }

      const value = control.value;

      if (typeof value === "string" && value.trim() === "") {
        setFormStatus(
          "Preencha os campos obrigatórios para continuar.",
          "error",
        );
        if (typeof control.reportValidity === "function") {
          control.reportValidity();
        }
        control.focus();
        return false;
      }
    }

    // Validate radio groups
    const radioNames = new Set(
      controls
        .filter((c) => c.type === "radio" && c.offsetParent !== null)
        .map((c) => c.name),
    );

    for (const name of radioNames) {
      const checked = currentStepElement.querySelector(
        `input[type="radio"][name="${name}"]:checked`,
      );

      if (!checked) {
        const first = currentStepElement.querySelector(
          `input[type="radio"][name="${name}"]`,
        );
        setFormStatus(
          "Selecione uma opção obrigatória para continuar.",
          "error",
        );
        if (first) first.focus();
        return false;
      }
    }

    // Validate checkbox groups (at least one checked)
    const checkboxNames = new Set(
      controls
        .filter((c) => c.type === "checkbox" && c.offsetParent !== null)
        .map((c) => c.name),
    );

    for (const name of checkboxNames) {
      const checked = currentStepElement.querySelector(
        `input[type="checkbox"][name="${name}"]:checked`,
      );

      if (!checked) {
        const first = currentStepElement.querySelector(
          `input[type="checkbox"][name="${name}"]`,
        );
        setFormStatus("Marque ao menos uma opção para continuar.", "error");
        if (first) first.focus();
        return false;
      }
    }

    return true;
  };

  const validateCurrentStep = () => validateStep(currentStep);

  const validateAllFormSteps = () => {
    const originalStep = currentStep;

    for (let stepIndex = 0; stepIndex < lastStepIndex; stepIndex++) {
      currentStep = stepIndex;
      updateProgress(false);

      if (!validateStep(stepIndex)) {
        return false;
      }
    }

    currentStep = originalStep;
    updateProgress(false);
    return true;
  };

  const createReviewItem = (label, value) => `
    <div class="review-item">
      <span class="review-label">${escapeHtml(label)}</span>
      <strong class="review-value">${escapeHtml(value)}</strong>
    </div>
  `;

  const createReviewSection = (title, items) => `
    <section class="review-section">
      <h4>${escapeHtml(title)}</h4>
      <div class="review-list">
        ${items.join("")}
      </div>
    </section>
  `;

  const collectFormData = () => ({
    fullName: getFieldValue("full-name"),
    day: getFieldValue("day"),
    month: getFieldValue("month"),
    year: getFieldValue("year"),
    cpf: getFieldValue("cpf"),
    gender: getFieldValue("gender"),
    maritalStatus: getFieldValue("maritalStatus"),
    workStatus: getFieldValue("workStatus"),
    contribuicaoTempo: getFieldValue("contribuicaoTempo"),
    tempoDesemprego: getFieldValue("tempoDesemprego"),
    recolhimentosAnteriores: getFieldValue("recolhimentosAnteriores"),
    renda: getFieldValue("renda"),
    cadunico: getCheckedValue("cadunico"),
    moradia: getFieldValue("moradia"),
    dependents: getCheckedValue("dependents"),
    qtdDependentes: getFieldValue("qtdDependentes"),
    idadesDependentes: getFieldValue("idadesDependentes"),
    cuidador: getCheckedValue("cuidador"),
    pcd: getCheckedValue("pcd"),
    tipoDeficiencia: getFieldValue("tipoDeficiencia"),
    laudo: getCheckedValue("laudo"),
    doencas: Array.from(
      document.querySelectorAll('input[name="doencas"]:checked'),
    ).map((checkbox) => checkbox.value),
  });

  const saveDraft = () => {
    try {
      localStorage.setItem(
        draftStorageKey,
        JSON.stringify({
          currentStep,
          data: collectFormData(),
        }),
      );
    } catch (error) {
      console.warn("Não foi possível salvar o rascunho do formulário.", error);
    }
  };

  const applyDraft = (data) => {
    document.getElementById("full-name").value = data.fullName || "";
    document.getElementById("day").value = data.day || "";
    document.getElementById("month").value = data.month || "";
    document.getElementById("year").value = data.year || "";
    document.getElementById("cpf").value = data.cpf || "";
    document.getElementById("gender").value = data.gender || "";
    document.getElementById("maritalStatus").value = data.maritalStatus || "";
    document.getElementById("workStatus").value = data.workStatus || "";
    document.getElementById("contribuicaoTempo").value =
      data.contribuicaoTempo || "";
    document.getElementById("tempoDesemprego").value =
      data.tempoDesemprego || "";
    document.getElementById("recolhimentosAnteriores").value =
      data.recolhimentosAnteriores || "";
    document.getElementById("renda").value = data.renda || "";
    document.getElementById("moradia").value = data.moradia || "";
    document.getElementById("qtdDependentes").value = data.qtdDependentes || "";
    document.getElementById("idadesDependentes").value =
      data.idadesDependentes || "";
    document.getElementById("tipoDeficiencia").value =
      data.tipoDeficiencia || "";

    document.querySelectorAll('input[name="cadunico"]').forEach((radio) => {
      radio.checked = radio.value === data.cadunico;
    });

    document.querySelectorAll('input[name="dependents"]').forEach((radio) => {
      radio.checked = radio.value === data.dependents;
    });

    document.querySelectorAll('input[name="cuidador"]').forEach((radio) => {
      radio.checked = radio.value === data.cuidador;
    });

    document.querySelectorAll('input[name="pcd"]').forEach((radio) => {
      radio.checked = radio.value === data.pcd;
    });

    document.querySelectorAll('input[name="laudo"]').forEach((radio) => {
      radio.checked = radio.value === data.laudo;
    });

    document.querySelectorAll('input[name="doencas"]').forEach((checkbox) => {
      checkbox.checked = Array.isArray(data.doencas)
        ? data.doencas.includes(checkbox.value)
        : false;
    });

    toggleDependentes(data.dependents === "sim");
    togglePCD(data.pcd === "sim");

    const workStatusEvent = new Event("change", { bubbles: true });
    document.getElementById("workStatus").dispatchEvent(workStatusEvent);

    if (data.dependents !== "sim") {
      document.getElementById("qtdDependentes").value = "";
      document.getElementById("idadesDependentes").value = "";
    }

    if (data.pcd !== "sim") {
      document.getElementById("tipoDeficiencia").value = "";
      document.querySelectorAll('input[name="laudo"]').forEach((radio) => {
        radio.checked = false;
      });
    }

    if (Array.isArray(data.doencas) && data.doencas.includes("nenhuma")) {
      document
        .querySelectorAll('input[name="doencas"]:not([value="nenhuma"])')
        .forEach((checkbox) => {
          checkbox.checked = false;
        });
    }
  };

  const restoreDraft = () => {
    try {
      const storedDraft = localStorage.getItem(draftStorageKey);

      if (!storedDraft) {
        return;
      }

      const parsedDraft = JSON.parse(storedDraft);

      if (parsedDraft?.data) {
        applyDraft(parsedDraft.data);
      }

      if (Number.isInteger(parsedDraft?.currentStep)) {
        currentStep = Math.max(
          0,
          Math.min(parsedDraft.currentStep, lastStepIndex),
        );
      }
    } catch (error) {
      console.warn(
        "Não foi possível restaurar o rascunho do formulário.",
        error,
      );
    }
  };

  const generateReview = () => {
    if (!reviewContent) {
      return;
    }

    const data = collectFormData();
    const sections = [];

    sections.push(
      createReviewSection("Dados pessoais", [
        createReviewItem("Nome completo", data.fullName || "Não informado"),
        createReviewItem(
          "Data de nascimento",
          data.day && data.month && data.year
            ? `${data.day}/${data.month}/${data.year}`
            : "Não informado",
        ),
        createReviewItem("CPF", data.cpf || "Não informado"),
        createReviewItem("Sexo", resolveValue(data.gender, genderLabels)),
        createReviewItem(
          "Estado civil",
          resolveValue(data.maritalStatus, maritalLabels),
        ),
      ]),
    );

    const workItems = [
      createReviewItem(
        "Situação de trabalho",
        resolveValue(data.workStatus, workLabels),
      ),
    ];

    if (["formal", "mei"].includes(data.workStatus)) {
      workItems.push(
        createReviewItem(
          "Tempo de contribuição ao INSS",
          resolveValue(data.contribuicaoTempo, contribuicaoLabels),
        ),
      );
    }

    if (data.workStatus === "desempregado") {
      workItems.push(
        createReviewItem(
          "Tempo desempregado",
          resolveValue(data.tempoDesemprego, desempregoLabels),
        ),
      );
      workItems.push(
        createReviewItem(
          "Teve carteira assinada nos últimos 36 meses",
          resolveValue(data.recolhimentosAnteriores, yesNoLabels),
        ),
      );
    }

    workItems.push(
      createReviewItem(
        "Renda per capita",
        resolveValue(data.renda, rendaLabels),
      ),
    );
    workItems.push(
      createReviewItem("CadÚnico", resolveValue(data.cadunico, cadunicoLabels)),
    );

    sections.push(createReviewSection("Trabalho e renda", workItems));

    const familyItems = [
      createReviewItem("Moradia", resolveValue(data.moradia, moradiaLabels)),
      createReviewItem(
        "Dependentes",
        data.dependents === "sim"
          ? `Sim${data.qtdDependentes ? ` (${data.qtdDependentes})` : ""}`
          : data.dependents === "nao"
            ? "Não"
            : "Não informado",
      ),
    ];

    if (data.dependents === "sim") {
      familyItems.push(
        createReviewItem(
          "Idades dos dependentes",
          data.idadesDependentes || "Não informado",
        ),
      );
    }

    familyItems.push(
      createReviewItem("É cuidador", resolveValue(data.cuidador, yesNoLabels)),
    );

    sections.push(createReviewSection("Família e moradia", familyItems));

    const healthItems = [
      createReviewItem(
        "Pessoa com deficiência (PCD)",
        resolveValue(data.pcd, yesNoLabels),
      ),
    ];

    if (data.pcd === "sim") {
      healthItems.push(
        createReviewItem(
          "Tipo de deficiência",
          resolveValue(data.tipoDeficiencia, tipoDeficienciaLabels),
        ),
      );
      healthItems.push(
        createReviewItem(
          "Laudo médico atualizado",
          resolveValue(data.laudo, {
            sim: "Atualizado",
            nao: "Não atualizado",
          }),
        ),
      );
    }

    const doencasSelecionadas = data.doencas.includes("nenhuma")
      ? ["Nenhuma das anteriores"]
      : data.doencas.map((doenca) => doencaLabels[doenca] || doenca);

    healthItems.push(
      createReviewItem(
        "Condições crônicas ou graves",
        doencasSelecionadas.length > 0
          ? doencasSelecionadas.join(", ")
          : "Não informado",
      ),
    );

    sections.push(
      createReviewSection("Saúde e condições especiais", healthItems),
    );

    reviewContent.innerHTML = sections.join("");
  };

  const updateStepHeight = () => {
    stepsContainer.style.height = steps[currentStep].offsetHeight + "px";
  };

  const updateButtons = () => {
    prevButton.hidden = currentStep === 0;
    resetButton.hidden = currentStep < lastStepIndex;
    nextButton.hidden = currentStep >= lastStepIndex;
    submitButton.hidden = !nextButton.hidden;
  };

  const updateProgress = (persist = true) => {
    const width = lastStepIndex === 0 ? 1 : currentStep / lastStepIndex;

    progress.style.transform = `scaleX(${width})`;

    stepIndicators.forEach((indicator, index) => {
      indicator.classList.toggle("current", currentStep === index);
      indicator.classList.toggle("done", currentStep > index);
    });

    steps.forEach((step, index) => {
      step.style.transform = `translateX(-${currentStep * 100}%)`;
      step.classList.toggle("current", currentStep === index);
    });

    updateButtons();
    syncPcdLayout();

    if (currentStep === lastStepIndex) {
      generateReview();
    }

    updateStepHeight();

    if (persist) {
      saveDraft();
    }
  };

  const resetForm = () => {
    form.reset();
    currentStep = 0;

    try {
      localStorage.removeItem(draftStorageKey);
    } catch (error) {
      console.warn("Não foi possível limpar o rascunho do formulário.", error);
    }

    toggleDependentes(false);
    togglePCD(false);
    document.getElementById("contribuicaoBox").classList.remove("visible");
    document.getElementById("desempregoBox").classList.remove("visible");
    document.getElementById("reviewContent").innerHTML = "";
    document
      .getElementById("workStatus")
      .dispatchEvent(new Event("change", { bubbles: true }));

    updateProgress(false);
  };

  window.addEventListener("resize", () => {
    requestAnimationFrame(updateStepHeight);
  });

  prevButton.addEventListener("click", (e) => {
    e.preventDefault();

    if (currentStep > 0) {
      currentStep--;
      updateProgress();
    }
  });

  nextButton.addEventListener("click", (e) => {
    e.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < lastStepIndex) {
      currentStep++;
      updateProgress();
    }
  });

  resetButton.addEventListener("click", (e) => {
    e.preventDefault();

    const shouldReset = window.confirm(
      "Tem certeza que deseja apagar todas as informações e recomeçar?",
    );

    if (!shouldReset) {
      return;
    }

    resetForm();
  });

  form.addEventListener("input", () => {
    if (formStatus?.textContent) {
      setFormStatus("");
    }

    // sanitize name and format CPF as user types
    if (nameInput) {
      const sanitized = sanitizeName(nameInput.value);
      if (sanitized !== nameInput.value) nameInput.value = sanitized;
    }

    if (cpfInput) {
      const formatted = formatCpf(cpfInput.value);
      if (formatted !== cpfInput.value) cpfInput.value = formatted;
    }

    if (agesInput) {
      const v = agesInput.value;
      let cleaned = v.replace(/[^\d, ]+/g, "");
      cleaned = cleaned.replace(/,+/g, ",");
      cleaned = cleaned.replace(/\s*,\s*/g, ", ");
      cleaned = cleaned.replace(/^\s*,\s*/g, "");
      cleaned = cleaned.replace(/\s*,$/g, "");

      if (cleaned !== v) agesInput.value = cleaned;
    }

    if (currentStep === lastStepIndex) {
      generateReview();
    }

    saveDraft();
  });

  form.addEventListener("change", (event) => {
    if (event.target?.name === "pcd") {
      const isYes = event.target.value === "sim" && event.target.checked;
      togglePCD(isYes);
    }

    if (currentStep === lastStepIndex) {
      generateReview();
    }

    saveDraft();
  });

  document.querySelectorAll('input[name="doencas"]').forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      if (checkbox.value === "nenhuma" && checkbox.checked) {
        document
          .querySelectorAll('input[name="doencas"]:not([value="nenhuma"])')
          .forEach((otherCheckbox) => {
            otherCheckbox.checked = false;
          });
      }

      if (checkbox.value !== "nenhuma" && checkbox.checked) {
        const noneCheckbox = document.querySelector(
          'input[name="doencas"][value="nenhuma"]',
        );

        if (noneCheckbox) {
          noneCheckbox.checked = false;
        }
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateAllFormSteps()) {
      return;
    }

    if (currentStep < lastStepIndex) {
      currentStep = lastStepIndex;
      updateProgress();
      setFormStatus("Revise os dados e clique em Enviar novamente.", "info");
      return;
    }

    generateReview();
    saveDraft();

    const payload = collectFormData();

    submitButton.disabled = true;

    try {
      const created = saveSubmission(payload);
      localStorage.removeItem(draftStorageKey);
      console.log("Envio salvo no navegador:", created);
      resetForm();
    } catch (err) {
      console.error("Erro ao salvar no navegador:", err);
      setFormStatus(
        "Não foi possível salvar os dados no navegador. Tente novamente.",
        "error",
      );
      alert("Não foi possível salvar os dados no navegador.");
    } finally {
      submitButton.disabled = false;
    }
  });

  restoreDraft();
  toggleDependentes(getCheckedValue("dependents") === "sim");
  togglePCD(getCheckedValue("pcd") === "sim");
  updateProgress();
});

function syncPcdLayout() {
  const formWizard = document.querySelector(".form-wizard");
  const pcdStep = document.getElementById("pcdBox")?.closest(".step");
  const pcdYes = document.querySelector('input[name="pcd"][value="sim"]');

  if (!formWizard || !pcdStep || !pcdYes) {
    return;
  }

  formWizard.classList.toggle(
    "pcd-compact",
    pcdStep.classList.contains("current") && pcdYes.checked,
  );
}

function refreshWizardHeight() {
  const currentStep = document.querySelector(".step.current");
  const stepsContainer = document.querySelector(".steps-container");

  if (currentStep && stepsContainer) {
    stepsContainer.style.height = currentStep.offsetHeight + "px";
  }
}

const daySelect = document.getElementById("day");
for (let i = 1; i <= 31; i++) {
  const option = document.createElement("option");
  const value = String(i).padStart(2, "0");
  option.value = value;
  option.textContent = value;
  daySelect.appendChild(option);
}

const yearSelect = document.getElementById("year");
for (let year = 2026; year >= 1900; year--) {
  const option = document.createElement("option");
  option.value = String(year);
  option.textContent = String(year);
  yearSelect.appendChild(option);
}

document.getElementById("workStatus").addEventListener("change", function (e) {
  const val = e.target.value;
  const contribBox = document.getElementById("contribuicaoBox");
  const desempregoBox = document.getElementById("desempregoBox");

  contribBox.classList.remove("visible");
  desempregoBox.classList.remove("visible");

  if (["formal", "mei"].includes(val)) {
    contribBox.classList.add("visible");
  } else if (val === "desempregado") {
    desempregoBox.classList.add("visible");
  }

  refreshWizardHeight();
});

function toggleDependentes(show) {
  const box = document.getElementById("dependentesBox");
  const qtdDependentes = document.getElementById("qtdDependentes");
  const idadesDependentes = document.getElementById("idadesDependentes");

  if (show) {
    box.classList.add("visible");
    qtdDependentes.required = true;
    qtdDependentes.disabled = false;
    idadesDependentes.required = true;
    idadesDependentes.disabled = false;
  } else {
    box.classList.remove("visible");
    qtdDependentes.required = false;
    qtdDependentes.disabled = true;
    qtdDependentes.value = "";
    idadesDependentes.required = false;
    idadesDependentes.disabled = true;
    idadesDependentes.value = "";
  }

  refreshWizardHeight();
}

function togglePCD(show) {
  const box = document.getElementById("pcdBox");
  const tipoDeficiencia = document.getElementById("tipoDeficiencia");
  const laudoRadios = document.querySelectorAll('input[name="laudo"]');

  if (show) {
    box.classList.add("visible");
    tipoDeficiencia.required = true;
    tipoDeficiencia.disabled = false;
    laudoRadios.forEach((radio) => {
      radio.required = true;
      radio.disabled = false;
    });
  } else {
    box.classList.remove("visible");
    tipoDeficiencia.required = false;
    tipoDeficiencia.disabled = true;
    tipoDeficiencia.value = "";
    laudoRadios.forEach((radio) => {
      radio.required = false;
      radio.disabled = true;
      radio.checked = false;
    });
  }

  syncPcdLayout();
  refreshWizardHeight();
}

function toggleOutrasDoencas(checkbox) {
  if (checkbox.checked) {
    document
      .querySelectorAll('input[name="doencas"]:not([value="nenhuma"])')
      .forEach((cb) => (cb.checked = false));
  }
}
