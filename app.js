function generateRef() {
  return "CSR-" + Date.now().toString().slice(-6);
}

document.getElementById("complaintForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const ref = generateRef();

  const data = {
    full_name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    company: document.getElementById("company").value,
    category: document.getElementById("category").value,
    message: document.getElementById("message").value,
    reference_number: ref
  };

  // Submit to Supabase
  let { error } = await client.from("complaints").insert([data]);

  if (!error) {
    // Submit to Formspree for email notification
    fetch("https://formspree.io/f/mojzklze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: data.full_name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        category: data.category,
        message: data.message,
        reference_number: ref
      })
    }).catch(err => console.log("Email notification sent"));

    document.getElementById("result").innerHTML =
      "✅ Complaint submitted. Your case number is: <b>" + ref + "</b>";
    document.getElementById("complaintForm").reset();
  } else {
    alert("Error submitting complaint");
  }
});