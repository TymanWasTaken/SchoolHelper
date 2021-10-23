window.onload = () => {
	// Parse the URL parameter
	function getParameterByName(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}
	const data = decodeURIComponent(escape(atob(getParameterByName('data'))));
	const parsed = JSON.parse(data);
	const questions = parsed.questions;
	const table = document.getElementById('answers');
	const rows = [];
	// Loop through questions
	for (const q of questions) {
		const answer = q.choices.find(c => c.correct);
		const tr = document.createElement('tr');
		const tds = [
			questions.indexOf(q) + 1,
			q.question,
			answer.answer
		].map(text => {
			const td = document.createElement('td');
			td.innerText = text;
			return td;
		});
		for (const td of tds) {
			tr.appendChild(td);
		}
		rows.push(tr);
	}
	// Add rows to table
	for (const row of rows) {
		table.appendChild(row);
	}
}

function updateTable() {
	// Declare variables
	var input, filter, table, tr, td, i, txtValue;
	input = document.getElementById("searchBox");
	filter = input.value.toUpperCase();
	table = document.getElementById("answers");
	tr = table.getElementsByTagName("tr");

	// Loop through all table rows, and hide those who don't match the search query
	for (i = 0; i < tr.length; i++) {
		td = tr[i].getElementsByTagName("td")[1];
		if (td) {
			txtValue = td.textContent || td.innerText;
			if (txtValue.toUpperCase().indexOf(filter) > -1) {
				tr[i].style.display = "";
			} else {
				tr[i].style.display = "none";
			}
		}
	}
}