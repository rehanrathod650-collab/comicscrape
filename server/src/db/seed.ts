import { prisma } from './client';

export async function seedDatabase() {
  console.log('⚡ Seeding ComicScrape database with initial resources, tags, and jobs...');

  // Clean old records
  await prisma.collectionResource.deleteMany({});
  await prisma.resource.deleteMany({});
  await prisma.collection.deleteMany({});
  await prisma.scraperJob.deleteMany({});
  await prisma.source.deleteMany({});
  await prisma.savedSearch.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.notification.deleteMany({});

  // 1. Sources
  const ghSource = await prisma.source.create({
    data: {
      type: 'GITHUB',
      name: 'GitHub Official API',
      status: 'CONNECTED',
      resourceCount: 22,
      lastSyncAt: new Date(),
      config: JSON.stringify({ rateLimitRemaining: 4950, rateLimitTotal: 5000 })
    }
  });

  const tgSource = await prisma.source.create({
    data: {
      type: 'TELEGRAM',
      name: 'Telegram Authorized & Public Channel Hub',
      status: 'CONNECTED',
      resourceCount: 21,
      lastSyncAt: new Date(),
      config: JSON.stringify({ channelsMonitored: 8, botApiConfigured: true })
    }
  });

  // 2. Tags
  const tagsList = [
    { name: 'python', slug: 'python' },
    { name: 'automation', slug: 'automation' },
    { name: 'react', slug: 'react' },
    { name: 'machine-learning', slug: 'machine-learning' },
    { name: 'cybersecurity', slug: 'cybersecurity' },
    { name: 'data-science', slug: 'data-science' },
    { name: 'devops', slug: 'devops' },
    { name: 'rust', slug: 'rust' },
    { name: 'go', slug: 'go' },
    { name: 'cheatsheet', slug: 'cheatsheet' },
    { name: 'pdf', slug: 'pdf' },
    { name: 'system-design', slug: 'system-design' }
  ];

  for (const t of tagsList) {
    await prisma.tag.create({ data: t });
  }

  // 3. 20+ GitHub Resources
  const githubResources = [
    {
      sourceType: 'GITHUB',
      sourceId: ghSource.id,
      externalId: 'gh_101',
      title: 'Python Automation Toolkit & Script Arsenal',
      description: 'Battle-tested collection of 150+ production-ready Python automation scripts, web scrapers, task runners, and scheduled cron utilities.',
      resourceType: 'REPOSITORY',
      url: 'https://github.com/the-comic-dev/python-automation-toolkit',
      canonicalUrl: 'https://github.com/the-comic-dev/python-automation-toolkit',
      owner: 'the-comic-dev',
      repository: 'python-automation-toolkit',
      language: 'Python',
      license: 'MIT',
      stars: 5420,
      forks: 874,
      contentHash: 'hash_gh_101',
      isDemo: true,
      importanceScore: 94.5,
      tags: 'python,automation,productivity,cli,scripts',
      readmePreview: '# Python Automation Toolkit\nCurated collection of automation tools.'
    },
    {
      sourceType: 'GITHUB',
      sourceId: ghSource.id,
      externalId: 'gh_102',
      title: 'React 19 Clean SaaS Dashboard & UI Kit',
      description: 'Modern, highly accessible SaaS dashboard template built with React 19, Tailwind CSS, Lucide icons, and high-performance charting widgets.',
      resourceType: 'TEMPLATE',
      url: 'https://github.com/frontend-heroes/react-saas-dashboard-kit',
      canonicalUrl: 'https://github.com/frontend-heroes/react-saas-dashboard-kit',
      owner: 'frontend-heroes',
      repository: 'react-saas-dashboard-kit',
      language: 'TypeScript',
      license: 'Apache-2.0',
      stars: 8940,
      forks: 1420,
      contentHash: 'hash_gh_102',
      isDemo: true,
      importanceScore: 98.2,
      tags: 'react,dashboard,typescript,tailwind,saas',
      readmePreview: '# React 19 SaaS Dashboard Kit\nA production-grade SaaS frontend template.'
    },
    {
      sourceType: 'GITHUB',
      sourceId: ghSource.id,
      externalId: 'gh_103',
      title: 'Autonomous AI Agent Swarm Framework',
      description: 'Lightweight multi-agent orchestration architecture for orchestrating collaborative LLM workflows with deterministic memory.',
      resourceType: 'LIBRARY',
      url: 'https://github.com/mindcraft/agent-swarm-core',
      canonicalUrl: 'https://github.com/mindcraft/agent-swarm-core',
      owner: 'mindcraft',
      repository: 'agent-swarm-core',
      language: 'Python',
      license: 'MIT',
      stars: 12340,
      forks: 2150,
      contentHash: 'hash_gh_103',
      isDemo: true,
      importanceScore: 99.1,
      tags: 'ai-agents,llm,multi-agent,python,autonomous',
      readmePreview: '# Autonomous Agent Swarm Core\nMulti-agent reasoning framework.'
    },
    {
      sourceType: 'GITHUB',
      sourceId: ghSource.id,
      externalId: 'gh_104',
      title: 'Rust High-Speed Network Packet Sniffer & Inspector',
      description: 'Zero-copy high-throughput network monitoring and packet analysis CLI tool written in Rust with PCAP export.',
      resourceType: 'TOOL',
      url: 'https://github.com/rust-sec/packet-hound',
      canonicalUrl: 'https://github.com/rust-sec/packet-hound',
      owner: 'rust-sec',
      repository: 'packet-hound',
      language: 'Rust',
      license: 'GPL-3.0',
      stars: 3870,
      forks: 310,
      contentHash: 'hash_gh_104',
      isDemo: true,
      importanceScore: 88.4,
      tags: 'rust,networking,security,cybersecurity,cli'
    },
    {
      sourceType: 'GITHUB',
      sourceId: ghSource.id,
      externalId: 'gh_105',
      title: 'Full-Stack Machine Learning Engineering Handbook',
      description: 'Curated curriculum, architectural diagrams, model deployment pipelines, and end-to-end MLOps blueprints.',
      resourceType: 'DOCUMENTATION',
      url: 'https://github.com/ml-mastery/mlops-handbook',
      canonicalUrl: 'https://github.com/ml-mastery/mlops-handbook',
      owner: 'ml-mastery',
      repository: 'mlops-handbook',
      language: 'Jupyter Notebook',
      license: 'CC-BY-4.0',
      stars: 18200,
      forks: 4320,
      contentHash: 'hash_gh_105',
      isDemo: true,
      importanceScore: 97.8,
      tags: 'machine-learning,mlops,data-science,python,handbook'
    },
    {
      sourceType: 'GITHUB',
      sourceId: ghSource.id,
      externalId: 'gh_106',
      title: 'Go Microservices Boilerplate with gRPC & Observability',
      description: 'Production-grade enterprise Go microservices template featuring OpenTelemetry tracing, Prometheus metrics, and structured logging.',
      resourceType: 'CODE',
      url: 'https://github.com/gophers-guild/go-grpc-microservices-starter',
      canonicalUrl: 'https://github.com/gophers-guild/go-grpc-microservices-starter',
      owner: 'gophers-guild',
      repository: 'go-grpc-microservices-starter',
      language: 'Go',
      license: 'MIT',
      stars: 4620,
      forks: 780,
      contentHash: 'hash_gh_106',
      isDemo: true,
      importanceScore: 89.3,
      tags: 'go,grpc,microservices,kubernetes,opentelemetry'
    },
    {
      sourceType: 'GITHUB',
      sourceId: ghSource.id,
      externalId: 'gh_107',
      title: 'Modern Web Scraping Ninja Guide & Playwright Examples',
      description: 'Comprehensive repository covering ethical scraping patterns, dynamic rendering, proxy rotation, and anti-bot mitigation.',
      resourceType: 'TUTORIAL',
      url: 'https://github.com/scraping-ninja/playwright-scraper-patterns',
      canonicalUrl: 'https://github.com/scraping-ninja/playwright-scraper-patterns',
      owner: 'scraping-ninja',
      repository: 'playwright-scraper-patterns',
      language: 'TypeScript',
      license: 'MIT',
      stars: 6730,
      forks: 940,
      contentHash: 'hash_gh_107',
      isDemo: true,
      importanceScore: 92.6,
      tags: 'web-scraping,playwright,crawler,typescript,tutorial'
    },
    {
      sourceType: 'GITHUB',
      sourceId: ghSource.id,
      externalId: 'gh_108',
      title: 'DevOps & SRE Interview Questions with Deep Architectural Dives',
      description: '1000+ categorized DevOps, Linux internals, Kubernetes, Terraform, and CI/CD interview scenarios.',
      resourceType: 'EBOOK',
      url: 'https://github.com/sre-master/devops-interview-bible',
      canonicalUrl: 'https://github.com/sre-master/devops-interview-bible',
      owner: 'sre-master',
      repository: 'devops-interview-bible',
      language: 'Markdown',
      license: 'CC0-1.0',
      stars: 15400,
      forks: 3600,
      contentHash: 'hash_gh_108',
      isDemo: true,
      importanceScore: 95.0,
      tags: 'devops,kubernetes,sre,interview,study-guide'
    },
    {
      sourceType: 'GITHUB',
      sourceId: ghSource.id,
      externalId: 'gh_109',
      title: 'FastAPI Microservice Template with Async SQLAlchemy 2.0',
      description: 'Plug-and-play FastAPI template with async PostgreSQL engine, Alembic migrations, and Redis caching.',
      resourceType: 'CODE',
      url: 'https://github.com/tiangolo-fans/fastapi-clean-architecture',
      canonicalUrl: 'https://github.com/tiangolo-fans/fastapi-clean-architecture',
      owner: 'tiangolo-fans',
      repository: 'fastapi-clean-architecture',
      language: 'Python',
      license: 'MIT',
      stars: 7890,
      forks: 1120,
      contentHash: 'hash_gh_109',
      isDemo: true,
      importanceScore: 93.7,
      tags: 'python,fastapi,sqlalchemy,rest-api,clean-architecture'
    },
    {
      sourceType: 'GITHUB',
      sourceId: ghSource.id,
      externalId: 'gh_110',
      title: 'Prompt Engineering & LLM Jailbreak Defense Benchmark Dataset',
      description: 'Systematic dataset containing 5,000+ annotated adversarial prompts and mitigation defenses.',
      resourceType: 'DATASET',
      url: 'https://github.com/ai-safety-bench/prompt-injection-defense-corpus',
      canonicalUrl: 'https://github.com/ai-safety-bench/prompt-injection-defense-corpus',
      owner: 'ai-safety-bench',
      repository: 'prompt-injection-defense-corpus',
      language: 'Python',
      license: 'MIT',
      stars: 3410,
      forks: 420,
      contentHash: 'hash_gh_110',
      isDemo: true,
      importanceScore: 87.9,
      tags: 'dataset,ai-safety,prompt-engineering,security,llm'
    },
    {
      sourceType: 'GITHUB',
      sourceId: ghSource.id,
      externalId: 'gh_111',
      title: 'Vector Search Engine in Rust from Scratch',
      description: 'Educational embedding index and vector database built in Rust using SIMD accelerated cosine distance calculations.',
      resourceType: 'CODE',
      url: 'https://github.com/rust-search/vector-db-scratch',
      canonicalUrl: 'https://github.com/rust-search/vector-db-scratch',
      owner: 'rust-search',
      repository: 'vector-db-scratch',
      language: 'Rust',
      license: 'MIT',
      stars: 2980,
      forks: 340,
      contentHash: 'hash_gh_111',
      isDemo: true,
      importanceScore: 86.4,
      tags: 'rust,vector-database,embeddings,search,ai'
    },
    {
      sourceType: 'GITHUB',
      sourceId: ghSource.id,
      externalId: 'gh_112',
      title: 'Kafka Stream Processing Recipes & Failover Patterns',
      description: 'Resilient Apache Kafka stream topologies, exactly-once processing examples, and dead-letter queue architectures.',
      resourceType: 'TUTORIAL',
      url: 'https://github.com/data-streamers/kafka-resilient-patterns',
      canonicalUrl: 'https://github.com/data-streamers/kafka-resilient-patterns',
      owner: 'data-streamers',
      repository: 'kafka-resilient-patterns',
      language: 'Java',
      license: 'Apache-2.0',
      stars: 4120,
      forks: 690,
      contentHash: 'hash_gh_112',
      isDemo: true,
      importanceScore: 88.0,
      tags: 'kafka,streaming,distributed-systems,java'
    },
    {
      sourceType: 'GITHUB',
      sourceId: ghSource.id,
      externalId: 'gh_113',
      title: 'Tailwind CSS Component Forge: 200+ Animated Widgets',
      description: 'Copy-paste responsive UI blocks with zero extra JS dependencies, styled for SaaS, blogs, and marketing landing pages.',
      resourceType: 'TEMPLATE',
      url: 'https://github.com/tailwind-crafters/component-forge',
      canonicalUrl: 'https://github.com/tailwind-crafters/component-forge',
      owner: 'tailwind-crafters',
      repository: 'component-forge',
      language: 'HTML',
      license: 'MIT',
      stars: 11200,
      forks: 1840,
      contentHash: 'hash_gh_113',
      isDemo: true,
      importanceScore: 96.1,
      tags: 'tailwind,css,components,ui,web-development'
    },
    {
      sourceType: 'GITHUB',
      sourceId: ghSource.id,
      externalId: 'gh_114',
      title: 'PostgreSQL Deep Internal Tuning Scripts & Vacuum Analyzer',
      description: 'Diagnostic queries, autovacuum monitoring scripts, and memory buffer analysis dashboards for high-load PostgreSQL instances.',
      resourceType: 'TOOL',
      url: 'https://github.com/postgres-pros/pg-vacuum-diagnostics',
      canonicalUrl: 'https://github.com/postgres-pros/pg-vacuum-diagnostics',
      owner: 'postgres-pros',
      repository: 'pg-vacuum-diagnostics',
      language: 'PLpgSQL',
      license: 'PostgreSQL',
      stars: 3670,
      forks: 410,
      contentHash: 'hash_gh_114',
      isDemo: true,
      importanceScore: 87.5,
      tags: 'postgresql,sql,database,tuning,performance'
    },
    {
      sourceType: 'GITHUB',
      sourceId: ghSource.id,
      externalId: 'gh_115',
      title: 'Docker Security Scanner & Hardening Benchmark',
      description: 'Automated CIS Benchmark compliance scanner for container images with SBOM generation.',
      resourceType: 'TOOL',
      url: 'https://github.com/container-sec/docker-cis-auditor',
      canonicalUrl: 'https://github.com/container-sec/docker-cis-auditor',
      owner: 'container-sec',
      repository: 'docker-cis-auditor',
      language: 'Shell',
      license: 'Apache-2.0',
      stars: 5210,
      forks: 640,
      contentHash: 'hash_gh_115',
      isDemo: true,
      importanceScore: 90.2,
      tags: 'docker,security,devops,containers,audit'
    },
    {
      sourceType: 'GITHUB',
      sourceId: ghSource.id,
      externalId: 'gh_116',
      title: 'Modern TypeScript Design Patterns & Refactoring Guide',
      description: 'Interactive handbook on applying Gang of Four patterns effectively using modern TypeScript 5 syntax.',
      resourceType: 'DOCUMENTATION',
      url: 'https://github.com/ts-mastery/typescript-clean-patterns',
      canonicalUrl: 'https://github.com/ts-mastery/typescript-clean-patterns',
      owner: 'ts-mastery',
      repository: 'typescript-clean-patterns',
      language: 'TypeScript',
      license: 'MIT',
      stars: 9450,
      forks: 1320,
      contentHash: 'hash_gh_116',
      isDemo: true,
      importanceScore: 94.8,
      tags: 'typescript,design-patterns,refactoring,clean-code'
    },
    {
      sourceType: 'GITHUB',
      sourceId: ghSource.id,
      externalId: 'gh_117',
      title: 'GraphQL High-Performance Federation Gateway in Go',
      description: 'Subgraph composition engine with query deduplication and Redis response caching.',
      resourceType: 'LIBRARY',
      url: 'https://github.com/graphql-nexus/federation-gateway-go',
      canonicalUrl: 'https://github.com/graphql-nexus/federation-gateway-go',
      owner: 'graphql-nexus',
      repository: 'federation-gateway-go',
      language: 'Go',
      license: 'MIT',
      stars: 2840,
      forks: 310,
      contentHash: 'hash_gh_117',
      isDemo: true,
      importanceScore: 85.3,
      tags: 'graphql,go,microservices,api-gateway'
    },
    {
      sourceType: 'GITHUB',
      sourceId: ghSource.id,
      externalId: 'gh_118',
      title: 'Kubernetes Multi-Cluster GitOps Reference Architecture',
      description: 'ArgoCD cluster management templates with sealed secrets and automated canary deployments.',
      resourceType: 'CODE',
      url: 'https://github.com/gitops-cloud/k8s-multi-cluster-blueprint',
      canonicalUrl: 'https://github.com/gitops-cloud/k8s-multi-cluster-blueprint',
      owner: 'gitops-cloud',
      repository: 'k8s-multi-cluster-blueprint',
      language: 'HCL',
      license: 'Apache-2.0',
      stars: 6120,
      forks: 980,
      contentHash: 'hash_gh_118',
      isDemo: true,
      importanceScore: 91.5,
      tags: 'kubernetes,gitops,argocd,terraform,devops'
    },
    {
      sourceType: 'GITHUB',
      sourceId: ghSource.id,
      externalId: 'gh_119',
      title: 'Deep Reinforcement Learning Algorithms in JAX',
      description: 'Ultra-fast clean implementations of PPO, SAC, and DQN running on GPU/TPU with JAX.',
      resourceType: 'REPOSITORY',
      url: 'https://github.com/jax-rl/clean-jax-reinforcement-learning',
      canonicalUrl: 'https://github.com/jax-rl/clean-jax-reinforcement-learning',
      owner: 'jax-rl',
      repository: 'clean-jax-reinforcement-learning',
      language: 'Python',
      license: 'MIT',
      stars: 4890,
      forks: 570,
      contentHash: 'hash_gh_119',
      isDemo: true,
      importanceScore: 89.9,
      tags: 'python,jax,reinforcement-learning,ai,machine-learning'
    },
    {
      sourceType: 'GITHUB',
      sourceId: ghSource.id,
      externalId: 'gh_120',
      title: 'Modern Shell Scripting Styleguide & Defensive Templates',
      description: 'Best practices for Bash scripting: strict mode, signal handling, robust cleanup, and portable syntax.',
      resourceType: 'DOCUMENTATION',
      url: 'https://github.com/shell-craft/defensive-bash-playbook',
      canonicalUrl: 'https://github.com/shell-craft/defensive-bash-playbook',
      owner: 'shell-craft',
      repository: 'defensive-bash-playbook',
      language: 'Shell',
      license: 'CC0-1.0',
      stars: 13900,
      forks: 2100,
      contentHash: 'hash_gh_120',
      isDemo: true,
      importanceScore: 96.7,
      tags: 'bash,shell,scripting,linux,devops'
    },
    {
      sourceType: 'GITHUB',
      sourceId: ghSource.id,
      externalId: 'gh_121',
      title: 'Full-Stack Next.js 15 & AI Streaming Starter',
      description: 'End-to-end template featuring Vercel AI SDK, streaming tool calls, and PostgreSQL with Prisma.',
      resourceType: 'TEMPLATE',
      url: 'https://github.com/ai-stack/nextjs-ai-streaming-starter',
      canonicalUrl: 'https://github.com/ai-stack/nextjs-ai-streaming-starter',
      owner: 'ai-stack',
      repository: 'nextjs-ai-streaming-starter',
      language: 'TypeScript',
      license: 'MIT',
      stars: 7320,
      forks: 1140,
      contentHash: 'hash_gh_121',
      isDemo: true,
      importanceScore: 93.4,
      tags: 'nextjs,ai,typescript,react,llm'
    }
  ];

  for (const r of githubResources) {
    await prisma.resource.create({ data: r });
  }

  // 4. 20+ Telegram Resources
  const telegramResources = [
    {
      sourceType: 'TELEGRAM',
      sourceId: tgSource.id,
      externalId: 'tg_msg_90112',
      title: 'Python Complete Automation & Scripting Cheatsheet',
      description: 'Comprehensive 42-page visual cheatsheet covering OS manipulation, subprocesses, regular expressions, and Requests.',
      resourceType: 'PDF',
      url: 'https://t.me/PythonResourcesDaily/90112',
      canonicalUrl: 'https://t.me/PythonResourcesDaily/90112',
      channel: 'PythonResourcesDaily',
      fileName: 'Python_Automation_Cheatsheet_v4.pdf',
      fileExtension: 'pdf',
      mimeType: 'application/pdf',
      fileSize: 8808038,
      contentHash: 'hash_tg_90112',
      isDemo: true,
      importanceScore: 91.2,
      tags: 'python,pdf,cheatsheet,automation,notes'
    },
    {
      sourceType: 'TELEGRAM',
      sourceId: tgSource.id,
      externalId: 'tg_msg_90113',
      title: 'Deep Learning with PyTorch: Lecture Notes & Code Snippets',
      description: 'Annotated university lecture slides covering backpropagation, Transformers, attention mechanisms, and fine-tuning LoRA.',
      resourceType: 'PDF',
      url: 'https://t.me/AIDataScienceHub/4120',
      canonicalUrl: 'https://t.me/AIDataScienceHub/4120',
      channel: 'AIDataScienceHub',
      fileName: 'PyTorch_Deep_Learning_Master_Notes.pdf',
      fileExtension: 'pdf',
      mimeType: 'application/pdf',
      fileSize: 15728640,
      contentHash: 'hash_tg_90113',
      isDemo: true,
      importanceScore: 93.0,
      tags: 'pytorch,deep-learning,pdf,transformers,ai'
    },
    {
      sourceType: 'TELEGRAM',
      sourceId: tgSource.id,
      externalId: 'tg_msg_90114',
      title: 'Cybersecurity Red Team Field Kit & Exploitation Mindmap',
      description: 'Vector PDF mindmap detailing active directory persistence, privilege escalation, and evasion tactics.',
      resourceType: 'PDF',
      url: 'https://t.me/CyberSecNotesArchive/1589',
      canonicalUrl: 'https://t.me/CyberSecNotesArchive/1589',
      channel: 'CyberSecNotesArchive',
      fileName: 'Red_Team_Field_Playbook_2026.pdf',
      fileExtension: 'pdf',
      mimeType: 'application/pdf',
      fileSize: 6291456,
      contentHash: 'hash_tg_90114',
      isDemo: true,
      importanceScore: 89.8,
      tags: 'cybersecurity,infosec,pdf,redteam,pentest'
    },
    {
      sourceType: 'TELEGRAM',
      sourceId: tgSource.id,
      externalId: 'tg_msg_90115',
      title: 'System Design Interview: 25 Real-World Case Studies',
      description: 'Step-by-step breakdowns of high-scale architectures: Designing YouTube, Uber, TinyURL, and distributed rate limiters.',
      resourceType: 'EBOOK',
      url: 'https://t.me/TechInterviewPrep/3044',
      canonicalUrl: 'https://t.me/TechInterviewPrep/3044',
      channel: 'TechInterviewPrep',
      fileName: 'System_Design_Case_Studies_Compendium.epub',
      fileExtension: 'epub',
      mimeType: 'application/epub+zip',
      fileSize: 11534336,
      contentHash: 'hash_tg_90115',
      isDemo: true,
      importanceScore: 96.5,
      tags: 'system-design,architecture,interview,scalability,ebook'
    },
    {
      sourceType: 'TELEGRAM',
      sourceId: tgSource.id,
      externalId: 'tg_msg_90116',
      title: 'Docker & Kubernetes Offline Reference Archives',
      description: 'Offline bundle containing HTML documentation mirrors, configuration snippets, and Helm charts.',
      resourceType: 'ZIP',
      url: 'https://t.me/DevOpsVault/821',
      canonicalUrl: 'https://t.me/DevOpsVault/821',
      channel: 'DevOpsVault',
      fileName: 'k8s_docker_offline_docs_bundle.zip',
      fileExtension: 'zip',
      mimeType: 'application/zip',
      fileSize: 33554432,
      contentHash: 'hash_tg_90116',
      isDemo: true,
      importanceScore: 86.7,
      tags: 'kubernetes,docker,zip,devops,offline-docs'
    },
    {
      sourceType: 'TELEGRAM',
      sourceId: tgSource.id,
      externalId: 'tg_msg_90117',
      title: 'Frontend Performance Optimization Master Checklist',
      description: 'Detailed interactive guide on Core Web Vitals, LCP reduction, font loading strategies, and critical CSS.',
      resourceType: 'ARTICLE',
      url: 'https://t.me/FrontendDevelopersFeed/5540',
      canonicalUrl: 'https://t.me/FrontendDevelopersFeed/5540',
      channel: 'FrontendDevelopersFeed',
      contentHash: 'hash_tg_90117',
      isDemo: true,
      importanceScore: 90.4,
      tags: 'frontend,performance,web-vitals,javascript,tutorial'
    },
    {
      sourceType: 'TELEGRAM',
      sourceId: tgSource.id,
      externalId: 'tg_msg_90118',
      title: 'SQL Query Tuning & Postgres Indexing Deep Dive',
      description: 'Practical handbook on B-Tree vs GIN indexes, EXPLAIN ANALYZE execution plans, and slow queries.',
      resourceType: 'TUTORIAL',
      url: 'https://t.me/DatabaseInternals/2110',
      canonicalUrl: 'https://t.me/DatabaseInternals/2110',
      channel: 'DatabaseInternals',
      fileName: 'Postgres_Performance_Optimization_Guide.pdf',
      fileExtension: 'pdf',
      mimeType: 'application/pdf',
      fileSize: 4718592,
      contentHash: 'hash_tg_90118',
      isDemo: true,
      importanceScore: 94.1,
      tags: 'postgresql,sql,database,performance,pdf'
    },
    {
      sourceType: 'TELEGRAM',
      sourceId: tgSource.id,
      externalId: 'tg_msg_90119',
      title: 'Go (Golang) Concurrency Patterns with Channels & Goroutines',
      description: 'Visual code walkthroughs of fan-in, fan-out, pipeline processing, and context cancellation patterns.',
      resourceType: 'CODE',
      url: 'https://t.me/GoDevelopersWorld/789',
      canonicalUrl: 'https://t.me/GoDevelopersWorld/789',
      channel: 'GoDevelopersWorld',
      fileName: 'golang_concurrency_patterns.go',
      fileExtension: 'go',
      mimeType: 'text/x-go',
      fileSize: 45056,
      contentHash: 'hash_tg_90119',
      isDemo: true,
      importanceScore: 88.7,
      tags: 'go,golang,concurrency,patterns,code'
    },
    {
      sourceType: 'TELEGRAM',
      sourceId: tgSource.id,
      externalId: 'tg_msg_90120',
      title: 'Complete Free E-Books Collection for Data Scientists',
      description: 'Direct verified links for 30 open-access statistics, machine learning, and linear algebra textbooks.',
      resourceType: 'LINK',
      url: 'https://t.me/DataScienceLibrary/1420',
      canonicalUrl: 'https://t.me/DataScienceLibrary/1420',
      channel: 'DataScienceLibrary',
      contentHash: 'hash_tg_90120',
      isDemo: true,
      importanceScore: 92.3,
      tags: 'data-science,ebook,math,statistics,links'
    },
    {
      sourceType: 'TELEGRAM',
      sourceId: tgSource.id,
      externalId: 'tg_msg_90121',
      title: 'FastAPI + Docker Security Best Practices Cheat Sheet',
      description: 'Summary of non-root container configuration, multi-stage builds, CORS hardening, and rate limiting.',
      resourceType: 'PDF',
      url: 'https://t.me/PythonSecurityGroup/632',
      canonicalUrl: 'https://t.me/PythonSecurityGroup/632',
      channel: 'PythonSecurityGroup',
      fileName: 'FastAPI_Docker_Hardening_CheatSheet.pdf',
      fileExtension: 'pdf',
      mimeType: 'application/pdf',
      fileSize: 2097152,
      contentHash: 'hash_tg_90121',
      isDemo: true,
      importanceScore: 91.8,
      tags: 'fastapi,docker,security,python,pdf'
    },
    {
      sourceType: 'TELEGRAM',
      sourceId: tgSource.id,
      externalId: 'tg_msg_90122',
      title: 'Linux Kernel Exploitation & Memory Corruption Primer',
      description: 'Technical slide notes on ROP chains, heap grooming in kmalloc, and kernel address space layout randomization.',
      resourceType: 'PDF',
      url: 'https://t.me/CyberSecNotesArchive/1602',
      canonicalUrl: 'https://t.me/CyberSecNotesArchive/1602',
      channel: 'CyberSecNotesArchive',
      fileName: 'Linux_Kernel_Exploitation_Notes.pdf',
      fileExtension: 'pdf',
      mimeType: 'application/pdf',
      fileSize: 9437184,
      contentHash: 'hash_tg_90122',
      isDemo: true,
      importanceScore: 93.5,
      tags: 'linux,kernel,cybersecurity,pdf,exploit'
    },
    {
      sourceType: 'TELEGRAM',
      sourceId: tgSource.id,
      externalId: 'tg_msg_90123',
      title: 'Full-Stack JavaScript Roadmaps & Architecture Diagrams',
      description: 'Interactive SVG and PDF flowcharts mapping full-stack competencies from beginner to staff engineer.',
      resourceType: 'DOCUMENTATION',
      url: 'https://t.me/FrontendDevelopersFeed/5589',
      canonicalUrl: 'https://t.me/FrontendDevelopersFeed/5589',
      channel: 'FrontendDevelopersFeed',
      fileName: 'JS_FullStack_Roadmap_2026.pdf',
      fileExtension: 'pdf',
      mimeType: 'application/pdf',
      fileSize: 5242880,
      contentHash: 'hash_tg_90123',
      isDemo: true,
      importanceScore: 89.2,
      tags: 'javascript,roadmap,fullstack,career,pdf'
    },
    {
      sourceType: 'TELEGRAM',
      sourceId: tgSource.id,
      externalId: 'tg_msg_90124',
      title: 'Rust Memory Model & Async Runtime Internals',
      description: 'Deep dive into pin projections, epoll event loops, and Tokio work-stealing schedulers.',
      resourceType: 'ARTICLE',
      url: 'https://t.me/RustDaily/340',
      canonicalUrl: 'https://t.me/RustDaily/340',
      channel: 'RustDaily',
      contentHash: 'hash_tg_90124',
      isDemo: true,
      importanceScore: 92.0,
      tags: 'rust,async,tokio,memory,article'
    },
    {
      sourceType: 'TELEGRAM',
      sourceId: tgSource.id,
      externalId: 'tg_msg_90125',
      title: 'Microservices Resiliency Patterns: Circuit Breakers & Retries',
      description: 'Engineering notes on exponential backoff with jitter and bulkhead isolation in distributed networks.',
      resourceType: 'TUTORIAL',
      url: 'https://t.me/TechInterviewPrep/3100',
      canonicalUrl: 'https://t.me/TechInterviewPrep/3100',
      channel: 'TechInterviewPrep',
      fileName: 'Microservices_Resiliency_Handbook.pdf',
      fileExtension: 'pdf',
      mimeType: 'application/pdf',
      fileSize: 7340032,
      contentHash: 'hash_tg_90125',
      isDemo: true,
      importanceScore: 94.7,
      tags: 'microservices,resilience,architecture,patterns,pdf'
    },
    {
      sourceType: 'TELEGRAM',
      sourceId: tgSource.id,
      externalId: 'tg_msg_90126',
      title: 'Prompt Injection Attacks & Defenses Mindmap',
      description: 'Classification taxonomy of direct vs indirect prompt injections and sandboxing mitigations.',
      resourceType: 'PDF',
      url: 'https://t.me/AIDataScienceHub/4190',
      canonicalUrl: 'https://t.me/AIDataScienceHub/4190',
      channel: 'AIDataScienceHub',
      fileName: 'Prompt_Injection_Mitigation_Matrix.pdf',
      fileExtension: 'pdf',
      mimeType: 'application/pdf',
      fileSize: 3145728,
      contentHash: 'hash_tg_90126',
      isDemo: true,
      importanceScore: 91.0,
      tags: 'ai,prompt-injection,security,llm,pdf'
    },
    {
      sourceType: 'TELEGRAM',
      sourceId: tgSource.id,
      externalId: 'tg_msg_90127',
      title: 'Terraform AWS Production Boilerplate Bundle',
      description: 'Ready-to-use terraform root modules for secure VPC peering, ECS clusters, RDS aurora, and CloudWatch alarms.',
      resourceType: 'ZIP',
      url: 'https://t.me/DevOpsVault/850',
      canonicalUrl: 'https://t.me/DevOpsVault/850',
      channel: 'DevOpsVault',
      fileName: 'terraform_aws_production_suite.zip',
      fileExtension: 'zip',
      mimeType: 'application/zip',
      fileSize: 18874368,
      contentHash: 'hash_tg_90127',
      isDemo: true,
      importanceScore: 93.8,
      tags: 'terraform,aws,devops,infrastructure,zip'
    },
    {
      sourceType: 'TELEGRAM',
      sourceId: tgSource.id,
      externalId: 'tg_msg_90128',
      title: 'Computer Science Classical Algorithms in C++',
      description: 'Graph theory algorithms: Dijkstra, Bellman-Ford, Tarjan strongly connected components with unit tests.',
      resourceType: 'CODE',
      url: 'https://t.me/AlgorithmsArchive/210',
      canonicalUrl: 'https://t.me/AlgorithmsArchive/210',
      channel: 'AlgorithmsArchive',
      fileName: 'graph_algorithms_suite.cpp',
      fileExtension: 'cpp',
      mimeType: 'text/x-c',
      fileSize: 52428,
      contentHash: 'hash_tg_90128',
      isDemo: true,
      importanceScore: 89.6,
      tags: 'cpp,algorithms,data-structures,graphs,code'
    },
    {
      sourceType: 'TELEGRAM',
      sourceId: tgSource.id,
      externalId: 'tg_msg_90129',
      title: 'OAuth 2.0 & OpenID Connect Explained with Sequence Diagrams',
      description: 'Clear visual walkthrough of Authorization Code Grant with PKCE, token refresh rotations, and JWT signatures.',
      resourceType: 'DOCUMENTATION',
      url: 'https://t.me/PythonSecurityGroup/670',
      canonicalUrl: 'https://t.me/PythonSecurityGroup/670',
      channel: 'PythonSecurityGroup',
      fileName: 'OAuth2_PKCE_Complete_Architecture.pdf',
      fileExtension: 'pdf',
      mimeType: 'application/pdf',
      fileSize: 4194304,
      contentHash: 'hash_tg_90129',
      isDemo: true,
      importanceScore: 95.3,
      tags: 'oauth,security,jwt,auth,pdf'
    },
    {
      sourceType: 'TELEGRAM',
      sourceId: tgSource.id,
      externalId: 'tg_msg_90130',
      title: 'Pandas & Polars Data Wrangling Benchmark Cheatsheet',
      description: 'Side-by-side performance benchmarks comparing groupby operations, lazy frames, and memory overhead.',
      resourceType: 'PDF',
      url: 'https://t.me/DataScienceLibrary/1480',
      canonicalUrl: 'https://t.me/DataScienceLibrary/1480',
      channel: 'DataScienceLibrary',
      fileName: 'Pandas_vs_Polars_CheatSheet.pdf',
      fileExtension: 'pdf',
      mimeType: 'application/pdf',
      fileSize: 3670016,
      contentHash: 'hash_tg_90130',
      isDemo: true,
      importanceScore: 90.7,
      tags: 'python,pandas,polars,data-science,pdf'
    },
    {
      sourceType: 'TELEGRAM',
      sourceId: tgSource.id,
      externalId: 'tg_msg_90131',
      title: 'Kubernetes Pod Security Standards & OPA Gatekeeper Rules',
      description: 'Production YAML policies disallowing privileged containers, root users, and host network sharing.',
      resourceType: 'CODE',
      url: 'https://t.me/DevOpsVault/892',
      canonicalUrl: 'https://t.me/DevOpsVault/892',
      channel: 'DevOpsVault',
      fileName: 'k8s_gatekeeper_security_policies.yaml',
      fileExtension: 'yaml',
      mimeType: 'text/yaml',
      fileSize: 28672,
      contentHash: 'hash_tg_90131',
      isDemo: true,
      importanceScore: 91.4,
      tags: 'kubernetes,security,opa,devops,yaml'
    }
  ];

  for (const r of telegramResources) {
    await prisma.resource.create({ data: r });
  }

  // 5. 5 Collections
  const collectionsData = [
    {
      name: 'Python Automation & Tooling',
      description: 'Curated repositories, scripts, and PDF cheat sheets for automating workflows.',
      color: '#facc15',
      icon: 'Terminal'
    },
    {
      name: 'Machine Learning & MLOps',
      description: 'Everything from theoretical Transformers to production Kubernetes deployments.',
      color: '#38bdf8',
      icon: 'Brain'
    },
    {
      name: 'Frontend Architect Toolkit',
      description: 'React 19 templates, component systems, and Web Vitals optimization guides.',
      color: '#4ade80',
      icon: 'Layout'
    },
    {
      name: 'Cybersecurity & Red Team Notes',
      description: 'Penetration testing guides, exploit mitigation, and audit mindmaps.',
      color: '#f87171',
      icon: 'Shield'
    },
    {
      name: 'Distributed Systems & Go',
      description: 'gRPC templates, concurrency patterns, and resilience designs.',
      color: '#c084fc',
      icon: 'Server'
    }
  ];

  for (const c of collectionsData) {
    await prisma.collection.create({ data: c });
  }

  // 6. 5 Sample Discovery Jobs
  const sampleJobs = [
    {
      id: 'job-101',
      type: 'MANUAL_DISCOVERY',
      query: 'Python machine learning',
      sources: 'GITHUB,TELEGRAM',
      status: 'COMPLETED',
      progress: 100,
      currentTask: 'All resources indexed and deduplicated.',
      resourcesFound: 48,
      duplicatesFound: 6,
      logs: JSON.stringify([
        { timestamp: '07:45:00', step: 'GitHub Query', message: 'Discovered 28 matching repositories on GitHub API' },
        { timestamp: '07:45:20', step: 'Telegram Channel Scrape', message: 'Scanned 4 authorized public channels; found 20 posts with media' },
        { timestamp: '07:45:40', step: 'Deduplication', message: 'Detected 6 duplicate canonical URLs with confidence >0.85' },
        { timestamp: '07:46:12', step: 'Completed', message: 'Indexed 48 unique resources into local catalog' }
      ]),
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(Date.now() - 3540000)
    },
    {
      id: 'job-102',
      type: 'SCHEDULED_DISCOVERY',
      query: 'React dashboard templates',
      sources: 'GITHUB',
      status: 'RUNNING',
      progress: 68,
      currentTask: 'Parsing repository README metadata & licenses...',
      resourcesFound: 24,
      duplicatesFound: 2,
      schedule: 'DAILY',
      logs: JSON.stringify([
        { timestamp: '08:15:00', step: 'GitHub Search', message: 'Fetched 30 candidate repositories matching query' },
        { timestamp: '08:15:30', step: 'Metadata Harvest', message: 'Parsing repository README metadata & licenses...' }
      ]),
      startedAt: new Date(Date.now() - 900000)
    },
    {
      id: 'job-103',
      type: 'SOURCE_SYNC',
      query: 'Authorized Channel Sync',
      sources: 'TELEGRAM',
      status: 'QUEUED',
      progress: 0,
      currentTask: 'Waiting in worker queue...',
      resourcesFound: 0,
      duplicatesFound: 0,
      logs: JSON.stringify([
        { timestamp: '08:20:00', step: 'Queueing', message: 'Job scheduled by user' }
      ])
    },
    {
      id: 'job-104',
      type: 'REINDEX',
      query: 'Full Database Re-index',
      sources: 'GITHUB,TELEGRAM',
      status: 'COMPLETED',
      progress: 100,
      currentTask: 'Full-text search vectors rebuilt.',
      resourcesFound: 42,
      duplicatesFound: 0,
      logs: JSON.stringify([
        { timestamp: '06:00:00', step: 'Reindex', message: 'Search indices synchronized' }
      ]),
      startedAt: new Date(Date.now() - 7200000),
      completedAt: new Date(Date.now() - 7180000)
    },
    {
      id: 'job-105',
      type: 'SCHEDULED_DISCOVERY',
      query: 'Cybersecurity mindmaps',
      sources: 'TELEGRAM',
      status: 'COMPLETED',
      progress: 100,
      currentTask: 'Found 12 security documents.',
      resourcesFound: 12,
      duplicatesFound: 1,
      schedule: 'WEEKLY',
      logs: JSON.stringify([
        { timestamp: '05:00:00', step: 'Completed', message: 'Weekly scan complete' }
      ]),
      startedAt: new Date(Date.now() - 86400000),
      completedAt: new Date(Date.now() - 86350000)
    }
  ];

  for (const j of sampleJobs) {
    await prisma.scraperJob.create({ data: j });
  }

  // 7. Sample Saved Searches
  await prisma.savedSearch.create({
    data: {
      query: 'Python AI agents',
      sources: 'GITHUB,TELEGRAM',
      frequency: 'DAILY',
      notifyOnNew: true,
      lastRunAt: new Date()
    }
  });

  await prisma.savedSearch.create({
    data: {
      query: 'Rust network tools',
      sources: 'GITHUB',
      frequency: 'WEEKLY',
      notifyOnNew: true,
      lastRunAt: new Date(Date.now() - 86400000)
    }
  });

  // 8. Sample Notifications
  await prisma.notification.create({
    data: {
      title: 'Discovery Job Completed',
      message: 'Found 48 new resources for query "Python machine learning".',
      type: 'SUCCESS',
      read: false,
      link: '/jobs'
    }
  });

  await prisma.notification.create({
    data: {
      title: 'Daily Saved Search Match',
      message: '3 new repositories matched your saved hunt "Python AI agents".',
      type: 'INFO',
      read: false,
      link: '/resources'
    }
  });

  console.log('✅ Seed completed successfully: 21 GitHub resources, 20 Telegram resources, 12 tags, 5 collections, 5 scraper jobs.');
}

if (require.main === module) {
  seedDatabase()
    .catch(e => {
      console.error('Seed error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
