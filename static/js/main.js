document.getElementById('prediction-form').addEventListener('submit', function (event) {

    event.preventDefault();



    // The resultDiv for displaying output

    const resultDiv = document.getElementById('result');

    resultDiv.textContent = 'Classifying...';

    resultDiv.style.color = 'black'; // Reset color



    // This is a base object with all possible features set to a default of 0.

    const formData = {

       koi_fpflag_nt: 0,

        koi_fpflag_ss: 0,

        koi_fpflag_co: 0,

        koi_fpflag_ec: 0,

        koi_period: 0,

        koi_period_err1: 0,

        koi_period_err2: 0,

        koi_time0bk: 0,

        koi_time0bk_err1: 0,

        koi_time0bk_err2: 0,

        koi_time0: 0,

        koi_time0_err1: 0,

        koi_time0_err2: 0,

        koi_eccen: 0,

        koi_impact: 0,

        koi_impact_err1: 0,

        koi_impact_err2: 0,

        koi_duration: 0,

        koi_duration_err1: 0,

        koi_duration_err2: 0,

        koi_depth: 0,

        koi_depth_err1: 0,

        koi_depth_err2: 0,

        koi_ror: 0,

        koi_ror_err1: 0,

        koi_ror_err2: 0,

        koi_srho: 0,

        koi_srho_err1: 0,

        koi_srho_err2: 0,

        koi_prad: 0,

        koi_prad_err1: 0,

        koi_prad_err2: 0,

        koi_sma: 0,

        koi_incl: 0,

        koi_teq: 0,

        koi_insol: 0,

        koi_insol_err1: 0,

        koi_insol_err2: 0,

        koi_dor: 0,

        koi_dor_err1: 0,

        koi_dor_err2: 0,

        koi_ldm_coeff4: 0,

        koi_ldm_coeff3: 0,

        koi_ldm_coeff2: 0,

        koi_ldm_coeff1: 0,

        koi_max_sngle_ev: 0,

        koi_max_mult_ev: 0,

        koi_model_snr: 0,

        koi_count: 0,

        koi_num_transits: 0,

        koi_tce_plnt_num: 0,

        koi_bin_oedp_sig: 0,

        koi_steff: 0,

        koi_steff_err1: 0,

        koi_steff_err2: 0,

        koi_slogg: 0,

        koi_slogg_err1: 0,

        koi_slogg_err2: 0,

        koi_smet: 0,

        koi_smet_err1: 0,

        koi_smet_err2: 0,

        koi_srad: 0,

        koi_srad_err1: 0,

        koi_srad_err2: 0,

        koi_smass: 0,

        koi_smass_err1: 0,

        koi_smass_err2: 0,

        ra: 0,

        dec: 0,

        koi_kepmag: 0,

        koi_gmag: 0,

        koi_rmag: 0,

        koi_imag: 0,

        koi_zmag: 0,

        koi_jmag: 0,

        koi_hmag: 0,

        koi_kmag: 0,

        koi_fwm_stat_sig: 0,

        koi_fwm_sra: 0,

        koi_fwm_sra_err: 0,

        koi_fwm_sdec: 0,

        koi_fwm_sdec_err: 0,

        koi_fwm_srao: 0,

        koi_fwm_srao_err: 0,

        koi_fwm_sdeco: 0,

        koi_fwm_sdeco_err: 0,

        koi_fwm_prao: 0,

        koi_fwm_prao_err: 0,

        koi_fwm_pdeco: 0,

        koi_fwm_pdeco_err: 0,

        koi_dicco_mra: 0,

        koi_dicco_mra_err: 0,

        koi_dicco_mdec: 0,

        koi_dicco_mdec_err: 0,

        koi_dicco_msky: 0,

        koi_dicco_msky_err: 0,

        koi_dikco_mra: 0,

        koi_dikco_mra_err: 0,

        koi_dikco_mdec: 0,

        koi_dikco_mdec_err: 0,

        koi_dikco_msky: 0,

        koi_dikco_msky_err: 0,

    };



    // Now, update the keys for the values we actually have in our form

    formData.koi_fpflag_co = parseFloat(document.getElementById('koi_fpflag_co').value);

    formData.koi_fpflag_ss = parseFloat(document.getElementById('koi_fpflag_ss').value);

    formData.koi_period = parseFloat(document.getElementById('koi_period').value);

    formData.koi_prad = parseFloat(document.getElementById('koi_prad').value);





    // Send the completed data object to our Flask API

    fetch('http://127.0.0.1:5000/predict', {

        method: 'POST',

        headers: {

            'Content-Type': 'application/json'

        },

        body: JSON.stringify(formData)

    })

    .then(response => response.json())

    .then(data => {

        if (data.prediction) {

            resultDiv.textContent = 'Prediction: ' + data.prediction;

            if (data.prediction === 'CONFIRMED') {

                resultDiv.style.color = 'green';

            } else if (data.prediction === 'FALSE POSITIVE') {

                resultDiv.style.color = 'red';

            } else {

                resultDiv.style.color = 'orange';

            }

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