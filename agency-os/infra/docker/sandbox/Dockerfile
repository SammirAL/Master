# Conteneur sandbox d'exécution pour le Developer et le Security Expert.
# Exécution isolée par site (tests, builds, scans SCA) — aucun accès aux
# environnements de production des sites. cf. docs/03-agents/README.md (notes 1, 6).
FROM node:22-bookworm-slim

# Outils de base pour builds, tests et analyses de sécurité (SCA).
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
     git ca-certificates curl jq \
  && rm -rf /var/lib/apt/lists/*

# Utilisateur non privilégié : la sandbox ne tourne jamais en root.
RUN useradd --create-home --shell /bin/bash sandbox
USER sandbox
WORKDIR /workspace

# Le workspace du site est monté à l'exécution en lecture/écriture bornée :
#   docker run --rm -v <data/sites/site_id>:/workspace agency-os-sandbox <cmd>
# Réseau restreint par la politique de la passerelle MCP (pas d'accès prod).

CMD ["node", "--version"]
