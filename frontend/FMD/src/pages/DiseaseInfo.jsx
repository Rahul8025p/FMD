import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function DiseaseInfo() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-emerald-50 to-white px-4 py-6 sm:px-6 md:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {t("disease.guideTag", "Farmer Guide")}
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-800 sm:text-3xl">
                {t("disease.title", "Disease Information: Foot and Mouth Disease (FMD)")}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {t("disease.subtitle", "Simple guidance for farmers to identify, prevent, and respond early.")}
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {t("common.back", "Go back")}
            </button>
          </div>
          <div className="mt-3">
            <LanguageSwitcher compact />
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-800">
              {t("disease.section1Title", "1) What is Foot and Mouth Disease?")}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {t(
                "disease.section1Desc",
                "Foot and Mouth Disease (FMD) is a highly contagious viral disease affecting cloven-hoofed animals like cattle, buffalo, sheep, and goats. It spreads quickly and can significantly reduce milk production, growth, and farm income if not controlled early."
              )}
            </p>
          </article>

          <article className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-800">{t("disease.section2Title", "2) Symptoms")}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>{t("disease.symptom1", "Fever and sudden drop in appetite")}</li>
              <li>{t("disease.symptom2", "Excess saliva or drooling")}</li>
              <li>{t("disease.symptom3", "Blisters/sores in mouth, tongue, gums, or hooves")}</li>
              <li>{t("disease.symptom4", "Lameness, difficulty walking, hoof pain")}</li>
              <li>{t("disease.symptom5", "Reduced milk yield and weakness")}</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-800">{t("disease.section3Title", "3) Causes")}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>{t("disease.cause1", "FMD virus transmission through direct animal contact")}</li>
              <li>{t("disease.cause2", "Contaminated feed, water, tools, or farm surfaces")}</li>
              <li>{t("disease.cause3", "Movement of infected animals between farms/markets")}</li>
              <li>{t("disease.cause4", "Poor biosecurity and delayed isolation of sick cattle")}</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-800">
              {t("disease.section4Title", "4) Prevention Methods")}
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>{t("disease.prevention1", "Follow regular vaccination schedules as advised by vets")}</li>
              <li>{t("disease.prevention2", "Isolate newly purchased or sick animals immediately")}</li>
              <li>{t("disease.prevention3", "Disinfect sheds, equipment, and transport vehicles")}</li>
              <li>{t("disease.prevention4", "Limit visitors and control animal movement")}</li>
              <li>{t("disease.prevention5", "Keep clean feed/water and maintain farm hygiene")}</li>
            </ul>
          </article>
        </section>

        <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-800">
            {t("disease.section5Title", "5) Treatment Guidance")}
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>{t("disease.treatment1", "There is no direct cure for the virus; treatment is supportive.")}</li>
            <li>{t("disease.treatment2", "Call a veterinarian immediately for proper diagnosis and care.")}</li>
            <li>{t("disease.treatment3", "Provide soft feed, clean water, and oral wound care as advised.")}</li>
            <li>{t("disease.treatment4", "Control secondary infections and pain using vet-prescribed medicines.")}</li>
            <li>{t("disease.treatment5", "Keep infected animals isolated until fully recovered.")}</li>
          </ul>
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {t("disease.warning", "Important: Always consult a certified veterinarian before medication.")}
          </div>
        </section>
      </div>
    </div>
  );
}

