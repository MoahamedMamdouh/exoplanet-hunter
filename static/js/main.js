// --- 1. EVENT LISTENER FOR THE MODEL STATS MODAL ---
const statsModal = document.getElementById('statsModal');
if (statsModal) {
    statsModal.addEventListener('show.bs.modal', event => {
        fetch('/stats')
            .then(response => response.json())
            .then(data => {
                const modalBody = document.getElementById('stats-modal-body');
                modalBody.innerHTML = '';

                const report = data.classification_report;
                let reportHtml = '<h4>Classification Report</h4><table class="table table-sm table-bordered"><thead><tr><th>Class</th><th>Precision</th><th>Recall</th><th>F1-Score</th><th>Support</th></tr></thead><tbody>';
                for (const key in report) {
                    if (typeof report[key] === 'object') {
                        const row = report[key];
                        reportHtml += `<tr><td><b>${key}</b></td><td>${row.precision.toFixed(2)}</td><td>${row.recall.toFixed(2)}</td><td>${row['f1-score'].toFixed(2)}</td><td>${row.support}</td></tr>`;
                    }
                }
                reportHtml += '</tbody></table>';

                const matrix = data.confusion_matrix;
                const labels = data.class_labels;
                let matrixHtml = '<h4 class="mt-4">Confusion Matrix</h4><p>Rows are true labels, columns are predicted labels.</p><table class="table table-sm table-bordered"><thead><tr><th>↓ True / → Predicted</th>';
                labels.forEach(label => matrixHtml += `<th>${label}</th>`);
                matrixHtml += '</tr></thead><tbody>';
                matrix.forEach((row, i) => {
                    matrixHtml += `<tr><td><b>${labels[i]}</b></td>`;
                    row.forEach(cell => matrixHtml += `<td>${cell}</td>`);
                    matrixHtml += '</tr>';
                });
                matrixHtml += '</tbody></table>';

                modalBody.innerHTML = reportHtml + matrixHtml;
            })
            .catch(error => {
                console.error('Error fetching stats:', error);
                document.getElementById('stats-modal-body').textContent = 'Could not load statistics.';
            });
    });
}


// --- 2. EVENT LISTENER FOR THE PREDICTION FORM ---
const predictionForm = document.getElementById('prediction-form');
if (predictionForm) {
    predictionForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const resultDiv = document.getElementById('result');
        resultDiv.textContent = 'Classifying...';
        resultDiv.style.color = 'black';

        // This formData object now contains your full, specific feature list.
        const formData = {
            koi_fpflag_nt: 0, koi_fpflag_ss: 0, koi_fpflag_co: 0, koi_fpflag_ec: 0,
            koi_period: 0, koi_period_err1: 0, koi_period_err2: 0, koi_time0bk: 0,
            koi_time0bk_err1: 0, koi_time0bk_err2: 0, koi_time0: 0, koi_time0_err1: 0,
            koi_time0_err2: 0, koi_eccen: 0, koi_impact: 0, koi_impact_err1: 0,
            koi_impact_err2: 0, koi_duration: 0, koi_duration_err1: 0,
            koi_duration_err2: 0, koi_depth: 0, koi_depth_err1: 0, koi_depth_err2: 0,
            koi_ror: 0, koi_ror_err1: 0, koi_ror_err2: 0, koi_srho: 0,
            koi_srho_err1: 0, koi_srho_err2: 0, koi_prad: 0, koi_prad_err1: 0,
            koi_prad_err2: 0, koi_sma: 0, koi_incl: 0, koi_teq: 0, koi_insol: 0,
            koi_insol_err1: 0, koi_insol_err2: 0, koi_dor: 0, koi_dor_err1: 0,
            koi_dor_err2: 0, koi_ldm_coeff4: 0, koi_ldm_coeff3: 0, koi_ldm_coeff2: 0,
            koi_ldm_coeff1: 0, koi_max_sngle_ev: 0, koi_max_mult_ev: 0,
            koi_model_snr: 0, koi_count: 0, koi_num_transits: 0, koi_tce_plnt_num: 0,
            koi_bin_oedp_sig: 0, koi_steff: 0, koi_steff_err1: 0, koi_steff_err2: 0,
            koi_slogg: 0, koi_slogg_err1: 0, koi_slogg_err2: 0, koi_smet: 0,
            koi_smet_err1: 0, koi_smet_err2: 0, koi_srad: 0, koi_srad_err1: 0,
            koi_srad_err2: 0, koi_smass: 0, koi_smass_err1: 0, koi_smass_err2: 0,
            ra: 0, dec: 0, koi_kepmag: 0, koi_gmag: 0, koi_rmag: 0, koi_imag: 0,
            koi_zmag: 0, koi_jmag: 0, koi_hmag: 0, koi_kmag: 0, koi_fwm_stat_sig: 0,
            koi_fwm_sra: 0, koi_fwm_sra_err: 0, koi_fwm_sdec: 0, koi_fwm_sdec_err: 0,
            koi_fwm_srao: 0, koi_fwm_srao_err: 0, koi_fwm_sdeco: 0,
            koi_fwm_sdeco_err: 0, koi_fwm_prao: 0, koi_fwm_prao_err: 0,
            koi_fwm_pdeco: 0, koi_fwm_pdeco_err: 0, koi_dicco_mra: 0,
            koi_dicco_mra_err: 0, koi_dicco_mdec: 0, koi_dicco_mdec_err: 0,
            koi_dicco_msky: 0, koi_dicco_msky_err: 0, koi_dikco_mra: 0,
            koi_dikco_mra_err: 0, koi_dikco_mdec: 0, koi_dikco_mdec_err: 0,
            koi_dikco_msky: 0, koi_dikco_msky_err: 0
        };

        // Update the keys with values from the form
        formData.koi_fpflag_co = parseFloat(document.getElementById('koi_fpflag_co').value);
        formData.koi_fpflag_ss = parseFloat(document.getElementById('koi_fpflag_ss').value);
        formData.koi_period = parseFloat(document.getElementById('koi_period').value);
        formData.koi_prad = parseFloat(document.getElementById('koi_prad').value);

        // Send the data to the Flask API
        fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.prediction) {
                resultDiv.textContent = 'Prediction: ' + data.prediction;
                resultDiv.style.color = data.prediction === 'CONFIRMED' ? 'green' : (data.prediction === 'FALSE POSITIVE' ? 'red' : 'orange');
            } else {
                resultDiv.textContent = 'Error: ' + data.error;
                resultDiv.style.color = 'red';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            resultDiv.textContent = 'Error: Could not connect to the server.';
            resultDiv.style.color = 'red';
        });
    });
}


// --- 3. EVENT LISTENER FOR THE HYPERPARAMETER RETRAIN FORM ---
const retrainForm = document.getElementById('retrain-form');
if (retrainForm) {
    retrainForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const resultDiv = document.getElementById('retrain-result');
        resultDiv.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p>Training new model... This may take up to 30 seconds.</p>';

        const hyperparams = {
            n_estimators: parseInt(document.getElementById('n_estimators').value),
            max_depth: parseInt(document.getElementById('max_depth').value)
        };

        // Send the parameters to our new /retrain endpoint
        fetch('/retrain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hyperparams)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                resultDiv.innerHTML = `<p class="text-danger">Error: ${data.error}</p>`;
                return;
            }

            const report = data;
            let reportHtml = '<h4>New Model Performance</h4><table class="table table-sm table-bordered"><thead><tr><th>Class</th><th>Precision</th><th>Recall</th><th>F1-Score</th><th>Support</th></tr></thead><tbody>';
            for (const key in report) {
                if (typeof report[key] === 'object') {
                    const row = report[key];
                    reportHtml += `<tr><td><b>${key}</b></td><td>${row.precision.toFixed(2)}</td><td>${row.recall.toFixed(2)}</td><td>${row['f1-score'].toFixed(2)}</td><td>${row.support}</td></tr>`;
                }
            }
            reportHtml += '</tbody></table>';
            resultDiv.innerHTML = reportHtml;
        })
        .catch(error => {
            console.error('Error during retraining:', error);
            resultDiv.innerHTML = '<p class="text-danger">An error occurred. Could not complete retraining.</p>';
        });
    });
}
// --- 3. EVENT LISTENER FOR THE UPLOAD FORM ---
const uploadForm = document.getElementById('upload-form');
if (uploadForm) {
    uploadForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const resultDiv = document.getElementById('upload-result');
        const fileInput = document.getElementById('new_data_file');
        const file = fileInput.files[0];

        if (!file) {
            resultDiv.innerHTML = '<p class="text-danger">Please select a file to upload.</p>';
            return;
        }

        resultDiv.innerHTML = '<div class="spinner-border text-warning" role="status"><span class="visually-hidden">Loading...</span></div><p>Uploading and starting retraining process...</p>';
        
        // Use FormData to send the file
        const formData = new FormData();
        formData.append('new_data_file', file);

        fetch('/upload_and_retrain', {
            method: 'POST',
            body: formData // No Content-Type header needed; browser sets it for FormData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                resultDiv.innerHTML = `<p class="text-danger">Error: ${data.error}</p>`;
            } else {
                resultDiv.innerHTML = `<p class="text-success">${data.message}</p>`;
            }
        })
        .catch(error => {
            console.error('Error during upload:', error);
            resultDiv.innerHTML = '<p class="text-danger">An error occurred during upload.</p>';
        });
    });
}