/* ============================================
   LUCAS MANIVIT — PORTFOLIO i18n
   Lightweight FR/EN swap engine, zero deps.

   How it works:
   - HTML is written in FR (the default) so the page is fully
     usable with JS disabled.
   - This module reads localStorage and navigator.language to
     pick the active language, then walks data-i18n attributes
     and swaps text content / attributes when language is EN.
   - Toggling re-applies the dictionary live.
   - Emits "i18n:lang-changed" on window for the hero rotator
     to pick up a localised roles list.

   Markup conventions used in the HTML files:
     data-i18n="key"                -> el.textContent
     data-i18n-html="key"           -> el.innerHTML
     data-i18n-aria="key"           -> aria-label attribute
     data-i18n-title="key"          -> title attribute
     data-i18n-placeholder="key"    -> placeholder attribute
     data-i18n-content="key"        -> content attribute (meta)
     data-i18n-alt="key"            -> alt attribute (img)
   ============================================ */

(function () {
  var STORAGE_KEY = 'lm-portfolio-lang';
  var DEFAULT_LANG = 'fr';
  var SUPPORTED = ['fr', 'en'];

  /* -------------------------------------------------------
     ROLES — bilingual lists for the hero typewriter rotator
  ------------------------------------------------------- */
  var ROLES = {
    fr: [
      'Ingénieur SCCM / Intune',
      'Ingénieur Environnement de Travail',
      'Ingénieur Réseaux & Sécurité',
      'Expert Automatisation & IA',
      'Endpoint Engineering Specialist',
      'AI-Enhanced IT Operations',
      'Infrastructure & Cybersecurity Engineer'
    ],
    en: [
      'SCCM / Intune Engineer',
      'Workplace Environment Engineer',
      'Network & Security Engineer',
      'Automation & AI Specialist',
      'Endpoint Engineering Specialist',
      'AI-Enhanced IT Operations',
      'Infrastructure & Cybersecurity Engineer'
    ]
  };

  /* -------------------------------------------------------
     TRANSLATIONS — keep keys identical across fr/en
  ------------------------------------------------------- */
  var T = {
    fr: {
      /* nav + lang */
      'nav.home': 'Accueil',
      'nav.skills': 'Compétences',
      'nav.path': 'Parcours',
      'nav.projects': 'Projets',
      'nav.contact': 'Contact',
      'nav.cv': 'CV ↓',
      'nav.menu_aria': 'Menu',
      'lang.toggle_aria': 'Changer la langue',
      'lang.fr_aria': 'Afficher en français',
      'lang.en_aria': 'Switch to English',

      /* hero */
      'hero.badge': 'Disponible · Ouvert aux opportunités à partir de 09/2026',
      'hero.role.prefix': 'Profil :',
      'hero.role.stack': 'SCCM · Intune · Réseaux · Cybersécurité · PowerShell · IA appliquée',
      'hero.subtitle': "Je déploie, sécurise et automatise des parcs d'endpoints à l'échelle entreprise — en alternance chez SYSTRA, parcours d'ingénieur Réseaux & Sécurité à ESIEE-IT.",
      'hero.metric1.label': 'postes administrés',
      'hero.metric2.label': 'temps de déploiement gagné',
      'hero.metric3.label': 'en IT entreprise',
      'hero.metric3.value': '3+ ans',
      'hero.cta.projects': 'Voir mes projets',
      'hero.cta.cv': 'Télécharger mon CV',
      'hero.avatar.alt': 'Photo de Lucas Manivit, SCCM/Intune Engineer chez SYSTRA',
      'hero.social.linkedin': 'LinkedIn',
      'hero.social.github': 'GitHub',
      'hero.social.email': 'Email',
      'hero.social.phone': 'Téléphone',
      'hero.social.contact': 'Contact',

      /* what I build / ma vision */
      'build.label': 'Ma vision technique',
      'build.title': "Du poste de travail au backbone — une vision d'architecte infrastructure.",
      'build.lede': "Je ne déploie pas juste des outils : je conçois des environnements IT qui passent à l'échelle, se laissent automatiser et restent défendables sous pression.",
      'build.pillar1.title': "Infrastructure à l'échelle",
      'build.pillar1.desc': 'Parcs endpoint, AD/Azure AD et tenants Intune dimensionnés pour grandir sans casser.',
      'build.pillar2.title': 'Automatisation des postes',
      'build.pillar2.desc': 'PowerShell, Graph API, scripts de conformité — moins de mains sur les postes, plus de signal sur les exceptions.',
      'build.pillar3.title': "Opérations pilotées par l'IA",
      'build.pillar3.desc': "Agents et modèles de langage branchés au triage d'incidents, à l'analyse de logs et à la rédaction de remédiations.",
      'build.pillar4.title': 'Environnements entreprise sécurisés',
      'build.pillar4.desc': "Durcissement AD, Sentinel One, Fortinet, conformité CIS — un parc qui résiste autant qu'il sert.",
      'build.pillar5.title': 'Orchestration de workflows',
      'build.pillar5.desc': 'n8n / Make / scripts maison : connecter les outils ITSM, Graph, Slack, mail et données métier.',
      'build.pillar6.title': 'Infrastructure-as-Code',
      'build.pillar6.desc': "Ansible, YAML, versionné dans Git — l'infrastructure devient déclarative, reproductible, auditable.",

      /* about */
      'about.label': 'À propos',
      'about.title': 'Qui suis-je ?',
      'about.p1': "Je suis à la frontière de deux mondes : l'<strong>infrastructure IT d'entreprise</strong> et l'<strong>IA qui commence à la piloter</strong>. Le jour, j'administre <strong>10 000+ postes</strong> chez SYSTRA (SCCM, Intune, PowerShell).",
      'about.p2': "À côté, je construis des <strong>agents et des workflows IA</strong> qui automatisent ce qu'aucun runbook ne devrait décrire à la main. Mon projet de fin d'études — <strong>ConformIT</strong> — en est la démonstration : de la donnée de conformité à la remédiation priorisée, avec un <strong>score de confiance</strong> avant d'agir.",
      'about.p3': "Mon fil rouge : relier <strong>infrastructure, sécurité, automatisation et IA</strong> pour résoudre de vrais problèmes d'entreprise — pas pour faire joli sur un slide.",
      'about.lang.fr': 'Français',
      'about.lang.fr.level': 'Natif',
      'about.lang.en': 'Anglais',
      'about.lang.en.level': 'TOEIC 835 (2025)',
      'about.lang.de': 'Allemand',
      'about.lang.de.level': 'Intermédiaire',
      'about.info.email': 'Email',
      'about.info.phone': 'Téléphone',
      'about.info.location': 'Localisation',
      'about.info.location.value': 'Cergy, 95800',
      'about.info.license': 'Permis',
      'about.info.license.value': 'Catégorie B',
      'about.info.role': 'Poste actuel',
      'about.info.role.value': 'SCCM/Intune Engineer',
      'about.info.company': 'Entreprise',
      'about.info.education': 'Formation',
      'about.info.education.value': 'ESIEE-IT (2023-2026)',
      'about.info.interests': "Centres d'intérêt",
      'about.info.interests.value': 'Cyber · IA · Trading · Sport',

      /* core expertise */
      'expertise.label': "Cœur d'expertise",
      'expertise.title': "Trois domaines, un fil rouge : l'infrastructure à l'échelle.",
      'expertise.card1.title': 'Ingénierie endpoint',
      'expertise.card1.desc': "Conception et opération de parcs d'endpoints à l'échelle entreprise — déploiement zero-touch, patching, conformité et monitoring sur des milliers d'appareils.",
      'expertise.card2.title': 'Réseaux & Cybersécurité',
      'expertise.card2.desc': "Segmentation réseau, accès distants sécurisés et supervision de menaces — appliqués en labs et en environnement entreprise.",
      'expertise.card3.title': 'Automatisation IT & IA',
      'expertise.card3.desc': "Industrialisation des tâches IT par scripting et intégration de l'IA appliquée à l'infrastructure — moins d'opérations manuelles, plus de valeur métier.",

      /* AI & Automation */
      'ai.label': 'IA & Automatisation',
      'ai.title': "L'IA appliquée aux opérations IT, pas comme un gadget.",
      'ai.lede': "J'expérimente et déploie des agents, des workflows et des modèles de langage pour faire ce qu'aucun runbook ne devrait avoir à décrire à la main — du triage d'incidents au scripting assisté.",
      'ai.card1.tag': 'Agents IA',
      'ai.card1.title': "Agents IA pour l'exploitation IT",
      'ai.card1.desc': "Assistants connectés à Graph API, SCCM, Intune et aux journaux des postes — capables d'analyser un incident, de proposer une remédiation PowerShell et de l'exécuter sous contrôle humain.",
      'ai.card2.tag': 'Orchestration',
      'ai.card2.title': 'Orchestration de workflows',
      'ai.card2.desc': "n8n, Make, scripts maison : pipelines reliant ITSM, Graph, Slack, Notion et bases métiers — les outils se parlent, les humains n'ont plus à recopier.",
      'ai.card3.tag': 'Infra augmentée IA',
      'ai.card3.title': "Infrastructure augmentée par l'IA",
      'ai.card3.desc': "Corrélation KB / CVE / parc, génération de scripts d'audit, suggestion de policies Intune — l'IA ne remplace pas l'administrateur, elle compresse le temps de raisonnement.",
      'ai.card4.tag': 'Automatisation des postes',
      'ai.card4.title': 'Automatisation des postes à grande échelle',
      'ai.card4.desc': 'Conformité, onboarding, remédiations, inventaire matériel — chaînés en PowerShell + Graph, paramétrés par tenant Intune, instrumentés pour le monitoring.',

      /* skills */
      'skills.label': 'Compétences',
      'skills.title': 'Stack technique',
      'skills.cat1': 'Endpoint & Déploiement',
      'skills.cat2': 'Cloud & Infra',
      'skills.cat3': 'Réseaux',
      'skills.cat4': 'Sécurité',
      'skills.cat5': 'OS & Dev',
      'skills.level.master': 'Maîtrise',
      'skills.level.practice': 'Pratique',
      'skills.level.notion': 'Notions',

      /* featured projects (index) */
      'projects.label': 'Projets',
      'projects.title': 'Trois projets représentatifs.',
      'projects.see_all': 'Tous les projets',
      'fp1.domain': 'Ingénierie endpoint',
      'fp1.status': 'Production · SYSTRA',
      'fp1.title': 'Optimisation des processus de déploiement et de provisioning endpoint',
      'fp1.ctx_label': 'Contexte',
      'fp1.ctx': "Parc enterprise multi-sites de <strong>10 000+ postes</strong> en environnement hybride <strong>SCCM / Intune</strong> : étapes de provisioning manuelles, workflows hétérogènes, écarts de conformité d'un site à l'autre.",
      'fp1.contrib_label': 'Contribution',
      'fp1.contrib': "Participation aux workflows de déploiement et de provisioning aux côtés de l'équipe : automatisation <strong>PowerShell</strong> (remédiations, inventaire, onboarding), packaging <strong>Win32</strong>, fiabilisation des étapes <strong>Autopilot</strong>, application de policies Intune, suivi de conformité endpoint et reporting standardisé. Support N2 / N3 sur les incidents de déploiement.",
      'fp1.res_label': 'Résultat',
      'fp1.res': 'Processus de provisioning standardisés et fiabilisés, étapes manuelles réduites et déploiements plus reproductibles sur le périmètre suivi.',
      'fp2.domain': 'Réseaux & Sécurité',
      'fp2.status': "Projet d'ingénieur — ESIEE-IT",
      'fp2.title': "Tests d'intrusion — Cartographie & exploitation d'infrastructure",
      'fp2.pb_label': 'Problème',
      'fp2.pb': "Auditer une infrastructure cible inconnue et démontrer les chemins d'attaque exploitables avant qu'un attaquant réel ne le fasse.",
      'fp2.sol_label': 'Solution',
      'fp2.sol': "Méthodologie complète : reconnaissance, cartographie réseau (Nmap), énumération de services, exploitation, post-exploitation et rédaction d'un rapport formel.",
      'fp2.res_label': 'Résultat',
      'fp2.res': 'Rapport de pentest livré, vulnérabilités hiérarchisées par criticité & plan de remédiation associé.',
      'fp3.domain': 'IA · Agents & Gouvernance',
      'fp3.status': 'Projet entrepreneurial · En développement',
      'fp3.title': 'Orkestra IA — Orchestration & gouvernance des agents IA',
      'fp3.pb_label': 'Problème',
      'fp3.pb': "Les agents IA explosent mais restent ingérables en production : outils dispersés, coûts API opaques, risques RGPD, ROI non prouvable. Le POC marche, la prod déraille.",
      'fp3.sol_label': 'Solution',
      'fp3.sol': "Une couche neutre qui découvre, compare, connecte, documente, supervise et gouverne les agents (human-in-the-loop, MCP-compatible) — sans réinventer à chaque projet.",
      'fp3.res_label': 'Résultat',
      'fp3.res': "Des agents « démo » qui deviennent des systèmes « production » : portables, contrôlables, mesurables (ROI). Marché agents IA : 7,8 → 52,6 Md$ d'ici 2030.",

      /* path / timeline */
      'path.label': 'Parcours',
      'path.title': 'Expériences & Formation',
      'path.work_label': 'Expériences professionnelles',
      'path.edu_label': 'Formation',
      'path.work1.date': "Fév. 2023 — Aujourd'hui",
      'path.work1.title': 'SCCM / Intune Engineer',
      'path.work1.company': 'SYSTRA — Alternance',
      'path.work1.metric1': '<strong>10 000+</strong> endpoints managés',
      'path.work1.metric2': '<strong>N2 / N3</strong> support utilisateurs',
      'path.work1.metric3': '<strong>PowerShell</strong> automation',
      'path.work1.bullet1': 'Déploiement, patching et monitoring applicatif sur un parc de 10 000+ appareils Windows.',
      'path.work1.bullet2': 'Automatisation des tâches IT en PowerShell (compliance, inventaire, remédiation).',
      'path.work1.bullet3': 'Résolution de tickets utilisateurs en niveau N2/N3, escalades coordonnées.',
      'path.work1.bullet4': 'Implémentation de PADS4 pour la gestion de contenu dynamique sur écrans.',
      'path.work1.bullet5': 'Supervision endpoint avec Sentinel One — détection et triage de vulnérabilités.',
      'path.work2.date': 'Sept. 2022 — Déc. 2022',
      'path.work2.title': 'Support IT',
      'path.work2.bullet1': 'Support hardware/software PC & Mac, tickets incidents',
      'path.work2.bullet2': "Diagnostic, résolution d'incidents, récupération de données",
      'path.work2.bullet3': 'Configuration VPN & firewalls pour la sécurité client',
      'path.work3.date': 'Fév. 2022 — Mars 2022',
      'path.work3.title': 'Administrateur Réseaux (Stage)',
      'path.work3.bullet1': 'Déploiement environnements réseau sécurisés (Fortinet, SSL/IPsec VPN)',
      'path.work3.bullet2': 'Infrastructure Active Directory avec GPOs',
      'path.work3.bullet3': 'Configuration VLANs & segmentation LAN',
      'path.edu1.date': '2023 — 2026',
      'path.edu1.title': 'Ingénieur Réseaux & Sécurité',
      'path.edu1.bullet1': 'Sécurisation des infrastructures IT',
      'path.edu1.bullet2': 'Architecture système & supervision réseau',
      'path.edu2.date': '2022 — 2023',
      'path.edu2.title': 'Licence Informatique (alternance)',
      'path.edu2.bullet1': "Gestion de projet IT, sécurité des systèmes d'information",
      'path.edu3.date': '2020 — 2022',
      'path.edu3.title': 'BTS SIO — option SISR',
      'path.edu3.bullet1': 'Virtualisation, sécurité système & réseau (RGPD, ANSSI, CNIL)',

      /* footer */
      'footer.rights': '© 2026 Lucas Manivit — Tous droits réservés',
      'footer.scrolltop_aria': 'Retour en haut',

      /* projects page */
      'pjs.title': 'Réalisations & Labs',
      'pjs.filter.all': 'Tous',
      'pjs.filter.ai': 'IA & Automatisation',
      'pjs.filter.infra': 'Endpoint & Sécurité OS',
      'pjs.filter.net': 'Réseaux',
      'pjs.filter.sec': 'Cybersécurité offensive',
      'pjs.filter.scripts': 'Automation',
      'pjs.filter.cloud': 'Cloud & Virtualisation',
      'pjs.featured_badge': 'À la une',
      'pjs.discuss_link': 'Échanger sur ce projet',
      'pjs.nda_badge': 'Code privé · NDA',
      'pjs.more.title': 'Plus de projets sur GitHub',
      'pjs.more.desc': "Labs, scripts d'automatisation et configurations d'infrastructure — repos publics complémentaires à ce portfolio.",
      'pjs.more.cta': 'Ouvrir le profil GitHub',
      /* the 4 new premium AI projects */
      'pjs.ai1.title': 'Assistant IA pour endpoint — SCCM / Intune',
      'pjs.ai1.status': 'Lab · Prototype',
      'pjs.ai1.desc': "Assistant IA local connecté aux logs SCCM/Intune et à Microsoft Graph. Analyse les incidents, interprète les journaux, propose des remédiations PowerShell et accompagne les équipes support N2/N3 — avec validation humaine avant exécution.",
      'pjs.ai2.title': "Orkestra IA — Orchestration & gouvernance des agents IA",
      'pjs.ai2.status': 'Startup · En développement',
      'pjs.ai2.desc': "La couche neutre entre les agents IA (MCP, LangChain, CrewAI, n8n, Make…) et les systèmes réels de l'entreprise : découvrir, comparer, connecter, documenter, superviser, gouverner (human-in-the-loop) et réutiliser les agents. L'objectif : passer des agents « démo » aux agents « production » — portables, contrôlables et rentables (coûts maîtrisés, RGPD, ROI mesuré).",
      'pjs.ai3.title': 'Pilotage intelligent des correctifs — Tableau de bord',
      'pjs.ai3.status': 'Lab · Pipeline',
      'pjs.ai3.desc': "Pipeline automatisé de corrélation entre KB Microsoft, données Cyberwatch et conformité endpoint Intune/SCCM. Identifie les postes à risque, les déploiements problématiques et priorise les remédiations — visualisation Power BI.",
      'pjs.ai4.title': "Lab d'analyse de malwares assistée par IA",
      'pjs.ai4.status': 'Lab · Cybersécurité',
      'pjs.ai4.desc': "Lab cybersécurité combinant sandbox isolée, parsing forensic, extraction d'IOC et résumé LLM — un workflow où l'IA accélère la lecture des artefacts (strings, imports, network, registry) sans remplacer le jugement de l'analyste.",
      /* a couple of high-traffic existing projects */
      'pjs.autopilot.title': 'Optimisation des processus de déploiement et de provisioning endpoint',
      'pjs.autopilot.status': 'Production · SYSTRA',
      'pjs.autopilot.desc': "Participation aux workflows hybrides <strong>SCCM / Intune</strong> sur un parc enterprise de 10 000+ postes : automatisation PowerShell (remédiations, inventaire, onboarding), packaging Win32, fiabilisation des étapes Autopilot, application de policies, suivi de conformité endpoint, reporting, support N2 / N3. Standardisation des processus et optimisation opérationnelle du provisioning.",
      'pjs.ps.title': 'Scripts PowerShell Intune / Graph API',
      'pjs.ps.desc': "Collection de scripts d'automatisation : inventaire matériel, remédiation de compliance, onboarding utilisateurs via Microsoft Graph API.",
      'pjs.pentest.title': "Tests d'intrusion — Cartographie & Exploitation",
      'pjs.pentest.status': "Projet d'ingénieur · ESIEE-IT",
      'pjs.pentest.desc': "Projet de fin d'études : audit complet d'une infrastructure cible. Reconnaissance, cartographie Nmap, énumération de services, exploitation et post-exploitation, puis rapport formel avec hiérarchisation CVSS des vulnérabilités et recommandations.",
      'pjs.mpls.title': "Backbone MPLS L3VPN — Projet transverse (équipe 3p)",
      'pjs.mpls.status': "Projet d'ingénieur · ESIEE-IT",
      'pjs.mpls.desc': "Conception et déploiement d'un backbone opérateur multi-routeurs : MPLS LDP, OSPF côté core, VRF par client, BGP MP-BGP pour le contrôle de plan VPN. Roadmap, configs et rapport livrés en équipe (GR · PR · LM).",
      'pjs.audit.title': "Audit Sécurité Poste de Travail",
      'pjs.audit.status': "Lab",
      'pjs.audit.desc': "Script PowerShell d'audit automatisé basé sur les benchmarks CIS : vérification BitLocker, UAC, pare-feu, politiques de mot de passe.",
      'pjs.ad.title': "Active Directory durci — Install, GPO & attaques",
      'pjs.ad.status': "Projet d'ingénieur · ESIEE-IT",
      'pjs.ad.desc': "Mise en place complète d'un AD : installation, structuration des OU, GPOs de durcissement (LSA Protection, Credential Guard, désactivation NTLMv1). Phase offensive : Kerberoasting, AS-REP roasting, BloodHound. Conclusion : recommandations de remédiation.",
      'pjs.malware.title': "Analyse de malware — Statique, dynamique, obfuscation",
      'pjs.malware.status': "Projet d'ingénieur · ESIEE-IT",
      'pjs.malware.desc': "Reverse engineering sur 3 TPs : analyse statique (PEStudio, strings), dynamique en sandbox isolée (Procmon, Wireshark, Cuckoo) et étude de techniques d'obfuscation & packing (UPX, custom packers).",
      'pjs.secureboot.title': "Secure Boot UEFI — Windows, Linux & administration Intune",
      'pjs.secureboot.status': "Projet d'ingénieur · ESIEE-IT",
      'pjs.secureboot.desc': "Étude approfondie : chaîne de confiance du firmware, signature des bootloaders, risques (bootkits, evil maid) et administration en parc Intune / OEM. Pertinent direct pour un poste SCCM/Intune Engineer.",
      'pjs.proxmox.title': "Provisionnement VM Proxmox via Ansible (IaC)",
      'pjs.proxmox.status': "Projet d'ingénieur · ESIEE-IT",
      'pjs.proxmox.desc': "Automatisation déclarative : playbooks Ansible idempotents pour créer, cloner et configurer des VMs sur Proxmox VE depuis un inventaire YAML. Base d'une approche Infrastructure-as-Code reproductible.",
      'pjs.openstack.title': "OpenStack — Déploiement d'un cloud privé",
      'pjs.openstack.status': "Projet d'ingénieur · ESIEE-IT",
      'pjs.openstack.desc': "Stand-up d'une infrastructure cloud privée : Keystone (auth), Glance (images), Nova (compute), Neutron (réseau), Horizon (UI). Création des projets, quotas, réseaux internes/externes et instances de validation.",
      'pjs.ps.status': "Production · SYSTRA",

      /* contact page */
      'contact.title': 'Travaillons ensemble',
      'contact.info.email': 'Email',
      'contact.info.phone': 'Téléphone',
      'contact.info.location': 'Localisation',
      'contact.info.location.value': 'Cergy, 95800 — Île-de-France',
      'contact.info.role': 'Poste actuel',
      'contact.info.role.value': 'SCCM/Intune Engineer — SYSTRA',
      'contact.availability.title': 'Disponible',
      'contact.availability.desc': 'Alternance en cours — Ouvert aux opportunités 2026',
      'contact.qr.title': 'Mon portfolio en un scan',
      'contact.qr.desc': 'Scannez pour ouvrir ou partager ce portfolio.',
      'contact.form.firstname': 'Prénom',
      'contact.form.firstname.ph': 'Votre prénom',
      'contact.form.lastname': 'Nom',
      'contact.form.lastname.ph': 'Votre nom',
      'contact.form.email': 'Email',
      'contact.form.email.ph': 'votre@email.com',
      'contact.form.company': 'Entreprise',
      'contact.form.company.ph': 'Votre entreprise',
      'contact.form.subject': 'Sujet',
      'contact.form.subject.default': 'Sélectionnez un sujet',
      'contact.form.subject.opp': 'Opportunité professionnelle',
      'contact.form.subject.project': 'Proposition de projet',
      'contact.form.subject.collab': 'Collaboration',
      'contact.form.subject.other': 'Autre',
      'contact.form.message': 'Message',
      'contact.form.message.ph': 'Décrivez votre projet ou votre demande...',
      'contact.form.submit': 'Envoyer le message',
      'contact.form.success': '✓ Message envoyé avec succès ! Je vous répondrai dans les plus brefs délais.',

      /* rotator fallback under reduced-motion */
      'rotator.fallback': 'Ingénieur SCCM / Intune · Environnement de travail · Réseaux & Sécurité · Automatisation & IA',

      /* meta tags — index */
      'meta.index.title': 'Lucas Manivit — SCCM / Intune Engineer · Ingénieur Réseaux & Sécurité',
      'meta.index.description': 'Lucas Manivit — Ingénieur SCCM / Intune en alternance chez SYSTRA (10 000+ endpoints), parcours ingénieur Réseaux & Sécurité à ESIEE-IT (promotion 2026). Expertise : SCCM, Intune, PowerShell, Active Directory, Windows Server, VLAN, VPN, Fortinet, Wireshark, Sentinel One, IA appliquée aux opérations IT.',
      'meta.index.og.title': 'Lucas Manivit — SCCM / Intune Engineer · Ingénieur Réseaux & Sécurité',
      'meta.index.og.description': "Ingénieur SCCM/Intune chez SYSTRA — 10 000+ endpoints. Parcours ingénieur Réseaux & Sécurité ESIEE-IT 2026. IA & automation appliquées à l'IT.",
      'meta.index.twitter.title': 'Lucas Manivit — SCCM / Intune Engineer',
      'meta.index.twitter.description': 'Ingénieur SCCM/Intune · 10 000+ endpoints · Parcours ingénieur Réseaux & Sécurité ESIEE-IT 2026.',

      /* meta tags — projects */
      'meta.projects.title': 'Projets — Lucas Manivit · SCCM / Intune Engineer',
      'meta.projects.description': 'Projets IT de Lucas Manivit — Déploiement endpoint, sécurité réseau, scripts PowerShell & Microsoft Graph. Production SYSTRA + labs ESIEE-IT.',
      'meta.projects.og.title': 'Projets — Lucas Manivit',
      'meta.projects.og.description': 'Déploiement endpoint, sécurité réseau, automatisation PowerShell — projets production & labs.',

      /* meta tags — contact */
      'meta.contact.title': 'Contact — Lucas Manivit · SCCM / Intune Engineer',
      'meta.contact.description': 'Contactez Lucas Manivit — Ingénieur SCCM/Intune en alternance chez SYSTRA, parcours ingénieur Réseaux & Sécurité à ESIEE-IT (promotion 2026). Disponible pour échanger sur des opportunités IT.',
      'meta.contact.og.title': 'Contact — Lucas Manivit',
      'meta.contact.og.description': "Disponible pour échanger sur des opportunités IT (SCCM, Intune, Réseaux & Sécurité)."
    },

    en: {
      /* nav + lang */
      'nav.home': 'Home',
      'nav.skills': 'Skills',
      'nav.path': 'Experience',
      'nav.projects': 'Projects',
      'nav.contact': 'Contact',
      'nav.cv': 'CV ↓',
      'nav.menu_aria': 'Menu',
      'lang.toggle_aria': 'Switch language',
      'lang.fr_aria': 'Afficher en français',
      'lang.en_aria': 'Switch to English',

      /* hero */
      'hero.badge': 'Available · Open to opportunities from 09/2026',
      'hero.role.prefix': 'Role:',
      'hero.role.stack': 'SCCM · Intune · Networking · Cybersecurity · PowerShell · Applied AI',
      'hero.subtitle': "I deploy, secure and automate enterprise-scale endpoint fleets — apprenticeship at SYSTRA, Network & Security engineering degree at ESIEE-IT.",
      'hero.metric1.label': 'endpoints managed',
      'hero.metric2.label': 'deployment time saved',
      'hero.metric3.label': 'in enterprise IT',
      'hero.metric3.value': '3+ years',
      'hero.cta.projects': 'See my projects',
      'hero.cta.cv': 'Download my CV',
      'hero.avatar.alt': 'Photo of Lucas Manivit, SCCM/Intune Engineer at SYSTRA',
      'hero.social.linkedin': 'LinkedIn',
      'hero.social.github': 'GitHub',
      'hero.social.email': 'Email',
      'hero.social.phone': 'Phone',
      'hero.social.contact': 'Contact',

      /* what I build / ma vision */
      'build.label': 'What I build',
      'build.title': "From workplace to backbone — an infrastructure architect's mindset.",
      'build.lede': "I don't just deploy tools: I design IT environments that scale, can be automated and remain defensible under pressure.",
      'build.pillar1.title': 'Infrastructure at scale',
      'build.pillar1.desc': 'Endpoint fleets, AD/Azure AD and Intune tenants sized to grow without breaking.',
      'build.pillar2.title': 'Endpoint automation',
      'build.pillar2.desc': 'PowerShell, Graph API, compliance scripts — fewer hands on the machines, sharper signal on exceptions.',
      'build.pillar3.title': 'AI-enhanced operations',
      'build.pillar3.desc': 'Agents and large language models wired into incident triage, log analysis and remediation drafting.',
      'build.pillar4.title': 'Secure enterprise environments',
      'build.pillar4.desc': 'AD hardening, Sentinel One, Fortinet, CIS compliance — a fleet that holds its ground while staying useful.',
      'build.pillar5.title': 'Workflow orchestration',
      'build.pillar5.desc': 'n8n / Make / custom scripts: connecting ITSM, Graph, Slack, mail and business data.',
      'build.pillar6.title': 'Infrastructure-as-Code',
      'build.pillar6.desc': 'Ansible, YAML, versioned in Git — infrastructure becomes declarative, reproducible, auditable.',

      /* about */
      'about.label': 'About',
      'about.title': 'Who am I?',
      'about.p1': "I sit at the boundary of two worlds: <strong>enterprise IT infrastructure</strong> and the <strong>AI that's starting to run it</strong>. By day, I manage <strong>10,000+ endpoints</strong> at SYSTRA (SCCM, Intune, PowerShell).",
      'about.p2': "On the side, I build <strong>AI agents and workflows</strong> that automate what no runbook should ever have to spell out by hand. My capstone project — <strong>ConformIT</strong> — is the proof: from compliance data to prioritised remediation, with a <strong>confidence score</strong> before acting.",
      'about.p3': "My through-line: connecting <strong>infrastructure, security, automation and AI</strong> to solve real business problems — not to look good on a slide.",
      'about.lang.fr': 'French',
      'about.lang.fr.level': 'Native',
      'about.lang.en': 'English',
      'about.lang.en.level': 'TOEIC 835 (2025)',
      'about.lang.de': 'German',
      'about.lang.de.level': 'Intermediate',
      'about.info.email': 'Email',
      'about.info.phone': 'Phone',
      'about.info.location': 'Location',
      'about.info.location.value': 'Cergy, 95800 (France)',
      'about.info.license': 'Driving licence',
      'about.info.license.value': 'Category B',
      'about.info.role': 'Current role',
      'about.info.role.value': 'SCCM / Intune Engineer',
      'about.info.company': 'Company',
      'about.info.education': 'Education',
      'about.info.education.value': 'ESIEE-IT (2023-2026)',
      'about.info.interests': 'Interests',
      'about.info.interests.value': 'Cyber · AI · Trading · Sport',

      /* core expertise */
      'expertise.label': 'Core expertise',
      'expertise.title': 'Three domains, one through-line: infrastructure at scale.',
      'expertise.card1.title': 'Endpoint engineering',
      'expertise.card1.desc': 'Designing and operating enterprise-scale endpoint fleets — zero-touch deployment, patching, compliance and monitoring across thousands of devices.',
      'expertise.card2.title': 'Networking & Cybersecurity',
      'expertise.card2.desc': 'Network segmentation, secure remote access and threat supervision — applied in labs and enterprise environments.',
      'expertise.card3.title': 'IT automation & AI',
      'expertise.card3.desc': 'Industrialising IT tasks through scripting and embedding AI into infrastructure work — fewer manual ops, more business value.',

      /* AI & Automation */
      'ai.label': 'AI & Automation',
      'ai.title': 'AI applied to IT operations — not as a gadget.',
      'ai.lede': 'I experiment with and deploy agents, workflows and large language models to do what no runbook should ever have to spell out by hand — from incident triage to assisted scripting.',
      'ai.card1.tag': 'AI agents',
      'ai.card1.title': 'AI agents for IT operations',
      'ai.card1.desc': "Assistants connected to Graph API, SCCM, Intune and endpoint logs — able to analyse an incident, suggest a PowerShell remediation and run it under human review.",
      'ai.card2.tag': 'Orchestration',
      'ai.card2.title': 'Workflow orchestration',
      'ai.card2.desc': 'n8n, Make, custom scripts: pipelines linking ITSM, Graph, Slack, Notion and business data — the tools talk, humans stop copy-pasting.',
      'ai.card3.tag': 'AI-augmented infra',
      'ai.card3.title': 'AI-augmented infrastructure',
      'ai.card3.desc': "KB / CVE / fleet correlation, generating audit scripts, suggesting Intune policies — AI doesn't replace the admin, it compresses thinking time.",
      'ai.card4.tag': 'Endpoint automation',
      'ai.card4.title': 'Endpoint automation at scale',
      'ai.card4.desc': 'Compliance, onboarding, remediations, hardware inventory — chained in PowerShell + Graph, parameterised per Intune tenant, instrumented for monitoring.',

      /* skills */
      'skills.label': 'Skills',
      'skills.title': 'Technical stack',
      'skills.cat1': 'Endpoint & Deployment',
      'skills.cat2': 'Cloud & Infrastructure',
      'skills.cat3': 'Networking',
      'skills.cat4': 'Security',
      'skills.cat5': 'OS & Dev',
      'skills.level.master': 'Proficient',
      'skills.level.practice': 'Working knowledge',
      'skills.level.notion': 'Familiar',

      /* featured projects (index) */
      'projects.label': 'Projects',
      'projects.title': 'Three representative projects.',
      'projects.see_all': 'All projects',
      'fp1.domain': 'Endpoint engineering',
      'fp1.status': 'Production · SYSTRA',
      'fp1.title': 'Optimising endpoint deployment and provisioning processes',
      'fp1.ctx_label': 'Context',
      'fp1.ctx': "Enterprise multi-site fleet of <strong>10,000+ devices</strong> in a hybrid <strong>SCCM / Intune</strong> environment: manual provisioning steps, inconsistent workflows, compliance drift across sites.",
      'fp1.contrib_label': 'Contribution',
      'fp1.contrib': "Contributed to deployment and provisioning workflows alongside the team: <strong>PowerShell</strong> automation (remediations, inventory, onboarding), <strong>Win32</strong> packaging, hardening of <strong>Autopilot</strong> steps, Intune policies, endpoint compliance tracking and standardised reporting. L2 / L3 support on deployment incidents.",
      'fp1.res_label': 'Outcome',
      'fp1.res': 'Standardised, hardened provisioning processes, fewer manual steps and more reproducible deployments across the tracked perimeter.',
      'fp2.domain': 'Networking & Security',
      'fp2.status': 'Engineering project — ESIEE-IT',
      'fp2.title': 'Penetration testing — Infrastructure mapping & exploitation',
      'fp2.pb_label': 'Problem',
      'fp2.pb': "Auditing an unknown target infrastructure and demonstrating exploitable attack paths before a real adversary does.",
      'fp2.sol_label': 'Solution',
      'fp2.sol': "End-to-end methodology: reconnaissance, network mapping (Nmap), service enumeration, exploitation, post-exploitation and a formal report.",
      'fp2.res_label': 'Outcome',
      'fp2.res': "Pentest report delivered, vulnerabilities prioritised by severity, with a paired remediation plan.",
      'fp3.domain': 'AI · Agents & Governance',
      'fp3.status': 'Entrepreneurial project · In development',
      'fp3.title': 'Orkestra IA — AI agent orchestration & governance',
      'fp3.pb_label': 'Problem',
      'fp3.pb': "AI agents are exploding but stay unmanageable in production: scattered tools, opaque API costs, GDPR risk, unprovable ROI. The POC works, production derails.",
      'fp3.sol_label': 'Solution',
      'fp3.sol': "A neutral layer that discovers, compares, connects, documents, monitors and governs agents (human-in-the-loop, MCP-compatible) — without reinventing them on every project.",
      'fp3.res_label': 'Outcome',
      'fp3.res': "'Demo' agents become 'production' systems: portable, controllable, measurable (ROI). AI agents market: $7.8B → $52.6B by 2030.",

      /* path / timeline */
      'path.label': 'Experience',
      'path.title': 'Work & education',
      'path.work_label': 'Professional experience',
      'path.edu_label': 'Education',
      'path.work1.date': 'Feb 2023 — Today',
      'path.work1.title': 'SCCM / Intune Engineer',
      'path.work1.company': 'SYSTRA — Apprenticeship',
      'path.work1.metric1': '<strong>10,000+</strong> endpoints managed',
      'path.work1.metric2': '<strong>L2 / L3</strong> user support',
      'path.work1.metric3': '<strong>PowerShell</strong> automation',
      'path.work1.bullet1': 'Deployment, patching and application monitoring across a fleet of 10,000+ Windows devices.',
      'path.work1.bullet2': 'IT task automation in PowerShell (compliance, inventory, remediation).',
      'path.work1.bullet3': 'Resolving L2/L3 user tickets and coordinating escalations.',
      'path.work1.bullet4': 'Implementing PADS4 for dynamic content management on displays.',
      'path.work1.bullet5': 'Endpoint supervision with Sentinel One — vulnerability detection and triage.',
      'path.work2.date': 'Sep 2022 — Dec 2022',
      'path.work2.title': 'IT Support',
      'path.work2.bullet1': 'PC & Mac hardware/software support, incident tickets',
      'path.work2.bullet2': 'Diagnostics, incident resolution, data recovery',
      'path.work2.bullet3': 'VPN & firewall configuration for client security',
      'path.work3.date': 'Feb 2022 — Mar 2022',
      'path.work3.title': 'Network Administrator (Internship)',
      'path.work3.bullet1': 'Deploying secure network environments (Fortinet, SSL/IPsec VPN)',
      'path.work3.bullet2': 'Active Directory infrastructure with GPOs',
      'path.work3.bullet3': 'VLAN configuration and LAN segmentation',
      'path.edu1.date': '2023 — 2026',
      'path.edu1.title': 'Network & Security Engineering Degree',
      'path.edu1.bullet1': 'Securing IT infrastructure',
      'path.edu1.bullet2': 'System architecture & network supervision',
      'path.edu2.date': '2022 — 2023',
      'path.edu2.title': 'Computer Science Bachelor (Apprenticeship)',
      'path.edu2.bullet1': 'IT project management, information system security',
      'path.edu3.date': '2020 — 2022',
      'path.edu3.title': 'Higher National Diploma — IT Services & Networks',
      'path.edu3.bullet1': 'Virtualisation, system & network security (GDPR, ANSSI, CNIL)',

      /* footer */
      'footer.rights': '© 2026 Lucas Manivit — All rights reserved',
      'footer.scrolltop_aria': 'Back to top',

      /* projects page */
      'pjs.title': 'Builds & Labs',
      'pjs.filter.all': 'All',
      'pjs.filter.ai': 'AI & Automation',
      'pjs.filter.infra': 'Endpoint & OS Security',
      'pjs.filter.net': 'Networking',
      'pjs.filter.sec': 'Offensive cybersecurity',
      'pjs.filter.scripts': 'Automation',
      'pjs.filter.cloud': 'Cloud & Virtualisation',
      'pjs.featured_badge': 'Featured',
      'pjs.discuss_link': 'Discuss this project',
      'pjs.nda_badge': 'Private code · NDA',
      'pjs.more.title': 'More projects on GitHub',
      'pjs.more.desc': 'Labs, automation scripts and infrastructure configs — public repos complementing this portfolio.',
      'pjs.more.cta': 'Open the GitHub profile',
      'pjs.ai1.title': 'AI-Powered Endpoint Assistant — SCCM / Intune',
      'pjs.ai1.status': 'Lab · Prototype',
      'pjs.ai1.desc': "Local AI assistant connected to SCCM/Intune logs and Microsoft Graph. Analyses incidents, interprets logs, suggests PowerShell remediations and supports L2/L3 teams — with human approval before any action.",
      'pjs.ai2.title': 'Orkestra IA — AI agent orchestration & governance',
      'pjs.ai2.status': 'Startup · In development',
      'pjs.ai2.desc': "The neutral layer between AI agents (MCP, LangChain, CrewAI, n8n, Make…) and a company's real systems: discover, compare, connect, document, monitor, govern (human-in-the-loop) and reuse agents. The goal: move from 'demo' agents to 'production' agents — portable, controllable and cost-effective (controlled cost, GDPR, measured ROI).",
      'pjs.ai3.title': 'Patch Intelligence Dashboard',
      'pjs.ai3.status': 'Lab · Pipeline',
      'pjs.ai3.desc': "Automated pipeline correlating Microsoft KB articles, Cyberwatch data and endpoint compliance on Intune/SCCM. Identifies at-risk machines, problematic rollouts and prioritises remediation — visualised in Power BI.",
      'pjs.ai4.title': 'AI-Assisted Malware & Threat Analysis Lab',
      'pjs.ai4.status': 'Lab · Cybersecurity',
      'pjs.ai4.desc': "Security lab combining isolated sandbox, forensic parsing, IOC extraction and LLM summarisation — a workflow where AI speeds up reading artifacts (strings, imports, network, registry) without replacing the analyst's judgment.",
      'pjs.autopilot.title': 'Optimising endpoint deployment and provisioning processes',
      'pjs.autopilot.status': 'Production · SYSTRA',
      'pjs.autopilot.desc': "Contributed to hybrid <strong>SCCM / Intune</strong> workflows on an enterprise fleet of 10,000+ devices: PowerShell automation (remediations, inventory, onboarding), Win32 packaging, Autopilot reliability work, Intune policies, endpoint compliance tracking, reporting, L2 / L3 support. Process standardisation and operational optimisation of provisioning.",
      'pjs.ps.title': 'PowerShell scripts — Intune / Graph API',
      'pjs.ps.desc': "Collection of automation scripts: hardware inventory, compliance remediation, user onboarding via the Microsoft Graph API.",
      'pjs.pentest.title': 'Penetration testing — Mapping & Exploitation',
      'pjs.pentest.status': "Engineering project · ESIEE-IT",
      'pjs.pentest.desc': "Engineering capstone: full audit of a target infrastructure. Reconnaissance, Nmap mapping, service enumeration, exploitation and post-exploitation, then a formal report with CVSS-prioritised vulnerabilities and recommendations.",
      'pjs.mpls.title': "MPLS L3VPN Backbone — Cross-team project (3 engineers)",
      'pjs.mpls.status': "Engineering project · ESIEE-IT",
      'pjs.mpls.desc': "Designed and deployed a multi-router carrier-grade backbone: MPLS LDP, OSPF in the core, per-customer VRFs, BGP MP-BGP for the VPN control plane. Roadmap, configs and report delivered as a team (GR · PR · LM).",
      'pjs.audit.title': "Workstation Security Audit",
      'pjs.audit.status': "Lab",
      'pjs.audit.desc': "Automated PowerShell audit script based on CIS benchmarks: BitLocker, UAC, firewall and password policy checks.",
      'pjs.ad.title': "Hardened Active Directory — Install, GPOs & attacks",
      'pjs.ad.status': "Engineering project · ESIEE-IT",
      'pjs.ad.desc': "Full AD stand-up: install, OU structure, hardening GPOs (LSA Protection, Credential Guard, NTLMv1 disabled). Offensive phase: Kerberoasting, AS-REP roasting, BloodHound. Concluded with remediation recommendations.",
      'pjs.malware.title': "Malware analysis — Static, dynamic, obfuscation",
      'pjs.malware.status': "Engineering project · ESIEE-IT",
      'pjs.malware.desc': "Reverse engineering across 3 labs: static analysis (PEStudio, strings), dynamic analysis in an isolated sandbox (Procmon, Wireshark, Cuckoo), plus a study of obfuscation & packing techniques (UPX, custom packers).",
      'pjs.secureboot.title': "UEFI Secure Boot — Windows, Linux & Intune administration",
      'pjs.secureboot.status': "Engineering project · ESIEE-IT",
      'pjs.secureboot.desc': "In-depth study: firmware chain of trust, bootloader signing, risks (bootkits, evil maid) and administration across an Intune / OEM-managed fleet. Directly relevant for a SCCM/Intune engineering role.",
      'pjs.proxmox.title': "Proxmox VM provisioning via Ansible (IaC)",
      'pjs.proxmox.status': "Engineering project · ESIEE-IT",
      'pjs.proxmox.desc': "Declarative automation: idempotent Ansible playbooks to create, clone and configure VMs on Proxmox VE from a YAML inventory. The foundation of a reproducible Infrastructure-as-Code approach.",
      'pjs.openstack.title': "OpenStack — Private cloud deployment",
      'pjs.openstack.status': "Engineering project · ESIEE-IT",
      'pjs.openstack.desc': "Stand-up of a private cloud infrastructure: Keystone (auth), Glance (images), Nova (compute), Neutron (networking), Horizon (UI). Projects, quotas, internal/external networks and validation instances configured.",
      'pjs.ps.status': "Production · SYSTRA",

      /* contact page */
      'contact.title': "Let's work together",
      'contact.info.email': 'Email',
      'contact.info.phone': 'Phone',
      'contact.info.location': 'Location',
      'contact.info.location.value': 'Cergy, 95800 — Île-de-France (Paris area)',
      'contact.info.role': 'Current role',
      'contact.info.role.value': 'SCCM / Intune Engineer — SYSTRA',
      'contact.availability.title': 'Available',
      'contact.availability.desc': 'Currently in apprenticeship — Open to 2026 opportunities',
      'contact.qr.title': 'My portfolio in one scan',
      'contact.qr.desc': 'Scan to open or share this portfolio.',
      'contact.form.firstname': 'First name',
      'contact.form.firstname.ph': 'Your first name',
      'contact.form.lastname': 'Last name',
      'contact.form.lastname.ph': 'Your last name',
      'contact.form.email': 'Email',
      'contact.form.email.ph': 'you@email.com',
      'contact.form.company': 'Company',
      'contact.form.company.ph': 'Your company',
      'contact.form.subject': 'Subject',
      'contact.form.subject.default': 'Select a subject',
      'contact.form.subject.opp': 'Job opportunity',
      'contact.form.subject.project': 'Project proposal',
      'contact.form.subject.collab': 'Collaboration',
      'contact.form.subject.other': 'Other',
      'contact.form.message': 'Message',
      'contact.form.message.ph': 'Describe your project or request...',
      'contact.form.submit': 'Send message',
      'contact.form.success': "✓ Message sent! I'll get back to you as soon as possible.",

      /* rotator fallback under reduced-motion */
      'rotator.fallback': 'SCCM / Intune Engineer · Workplace Environment · Network & Security · Automation & AI',

      /* meta tags — index */
      'meta.index.title': 'Lucas Manivit — SCCM / Intune Engineer · Network & Security Engineer',
      'meta.index.description': 'Lucas Manivit — SCCM / Intune apprentice engineer at SYSTRA (10,000+ endpoints), Network & Security engineering degree at ESIEE-IT (class of 2026). Expertise: SCCM, Intune, PowerShell, Active Directory, Windows Server, VLAN, VPN, Fortinet, Wireshark, Sentinel One, AI applied to IT operations.',
      'meta.index.og.title': 'Lucas Manivit — SCCM / Intune Engineer · Network & Security Engineer',
      'meta.index.og.description': 'SCCM/Intune engineer at SYSTRA — 10,000+ endpoints. Network & Security engineering degree, ESIEE-IT 2026. AI & automation applied to IT.',
      'meta.index.twitter.title': 'Lucas Manivit — SCCM / Intune Engineer',
      'meta.index.twitter.description': 'SCCM/Intune engineer · 10,000+ endpoints · Network & Security engineering degree, ESIEE-IT 2026.',

      /* meta tags — projects */
      'meta.projects.title': 'Projects — Lucas Manivit · SCCM / Intune Engineer',
      'meta.projects.description': 'IT projects by Lucas Manivit — Endpoint deployment, network security, PowerShell & Microsoft Graph automation. Production at SYSTRA + labs at ESIEE-IT.',
      'meta.projects.og.title': 'Projects — Lucas Manivit',
      'meta.projects.og.description': 'Endpoint deployment, network security, PowerShell automation — production & lab projects.',

      /* meta tags — contact */
      'meta.contact.title': 'Contact — Lucas Manivit · SCCM / Intune Engineer',
      'meta.contact.description': 'Contact Lucas Manivit — SCCM/Intune apprentice engineer at SYSTRA, Network & Security engineering degree at ESIEE-IT (class of 2026). Available to discuss IT opportunities.',
      'meta.contact.og.title': 'Contact — Lucas Manivit',
      'meta.contact.og.description': 'Available to discuss IT opportunities (SCCM, Intune, Networking & Security).'
    }
  };

  /* -------------------------------------------------------
     Detection & engine
  ------------------------------------------------------- */

  function detectInitialLang() {
    try {
      var stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    } catch (e) { /* localStorage may be blocked */ }
    var nav = (navigator.language || DEFAULT_LANG).slice(0, 2).toLowerCase();
    return SUPPORTED.indexOf(nav) !== -1 ? nav : DEFAULT_LANG;
  }

  function applyLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT_LANG;
    var dict = T[lang];

    document.documentElement.setAttribute('lang', lang);

    // textContent swap
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = dict[el.getAttribute('data-i18n')];
      if (v !== undefined) el.textContent = v;
    });

    // innerHTML swap (for content with <strong> etc.)
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var v = dict[el.getAttribute('data-i18n-html')];
      if (v !== undefined) el.innerHTML = v;
    });

    // Attribute-targeted swaps
    var ATTR_MAP = {
      'data-i18n-aria': 'aria-label',
      'data-i18n-title': 'title',
      'data-i18n-placeholder': 'placeholder',
      'data-i18n-content': 'content',
      'data-i18n-alt': 'alt'
    };
    Object.keys(ATTR_MAP).forEach(function (sourceAttr) {
      var targetAttr = ATTR_MAP[sourceAttr];
      document.querySelectorAll('[' + sourceAttr + ']').forEach(function (el) {
        var key = el.getAttribute(sourceAttr);
        var v = dict[key];
        if (v !== undefined) el.setAttribute(targetAttr, v);
      });
    });

    // Toggle button visual state
    document.querySelectorAll('.lang-toggle [data-lang]').forEach(function (btn) {
      var on = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });

    // Expose state for other modules + dispatch event for the rotator
    window.__portfolioLang = lang;
    window.__portfolioRoles = ROLES[lang];
    window.__portfolioRotatorFallback = dict['rotator.fallback'];
    try {
      window.dispatchEvent(new CustomEvent('i18n:lang-changed', {
        detail: { lang: lang, roles: ROLES[lang], fallback: dict['rotator.fallback'] }
      }));
    } catch (e) { /* CustomEvent should always be available in supported browsers */ }

    try { window.localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  function init() {
    // Wire toggle buttons
    document.querySelectorAll('.lang-toggle [data-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyLang(btn.getAttribute('data-lang'));
      });
    });
    applyLang(detectInitialLang());
  }

  // Expose ROLES early so the rotator can read it even before applyLang() runs
  window.__portfolioRoles = ROLES[detectInitialLang()];
  window.__portfolioLang = detectInitialLang();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
