function generateRef() {
  return "CSR-" + Date.now().toString().slice(-6);
}

document.getElementById("supportForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const ref = generateRef();

  const data = {
    full_name: document.getElementById("fullName").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    company: document.getElementById("company").value,
    category: document.getElementById("issueType").value,
    message: document.getElementById("description").value,
    reference_number: ref,
    status: "Pending"
  };

  try {
    // Submit to Supabase
    let { error } = await client.from("complaints").insert([data]);

    if (!error) {
      // Submit to Formspree for email notification to admin
      fetch("https://formspree.io/f/mojzklze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.full_name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          category: data.category,
          message: data.message,
          reference_number: ref,
          _subject: `🎫 New Support Request — Case ${ref}`
        })
      }).catch(err => console.error("Formspree notification error:", err));

      // Show success message with prominent case reference
      document.getElementById("supportForm").style.display = "none";
      document.getElementById("successMessage").classList.remove("hidden");
      document.getElementById("caseRefDisplay").textContent = ref;
      document.getElementById("successText").textContent = "Save your case reference. We'll contact you within 24 hours (usually much faster).";

      // Reset after 8 seconds
      setTimeout(() => {
        document.getElementById("supportForm").reset();
        document.getElementById("supportForm").style.display = "block";
        document.getElementById("successMessage").classList.add("hidden");
      }, 8000);
    } else {
      alert("Error submitting complaint: " + error.message);
    }
  } catch (err) {
    console.error(err);
    alert("Error submitting form");
  }
});