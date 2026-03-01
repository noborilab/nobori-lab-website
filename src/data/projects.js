export const projectsIntro =
  'Our research unravels the complexity of plant and microbial cell states during their interactions, with a particular focus on plant immune cell states. Recent discoveries have revealed that plants interacting with microbes exhibit various immune cell states that are molecularly and spatiotemporally distinct. Our projects aim to uncover the diversity, regulation, and functions of these immune cell states, and their interactions. To achieve these goals, we employ single-cell and spatial omics technologies, along with advanced molecular biology and computational approaches. Below are technologies and resources available in our group.'

export const projects = [
  {
    id: 'sc-spatial',
    title: 'Single-cell and spatial dissection of plant-microbe interactions',
    description:
      'Plants lack specialized and mobile immune cells. Any cell type encountering pathogens must mount immune responses and communicate with surrounding cells. We integrate time-resolved single-cell transcriptomic, epigenomic and spatial transcriptomic data to identify cell states and describe cell-state-specific gene-regulatory logic. We discovered PRIMER cells \u2014 a rare cell population at the nexus of immune-active hotspots.',
    publication: {
      text: 'Nobori, T., Monell, A., et al. (2025) Nature',
      href: 'https://www.nature.com/articles/s41586-024-08383-z',
    },
    resources: [
      { label: 'Data Browser', href: 'https://plantpathogenatlas.salk.edu/' },
      { label: 'GitHub (Multiomics)', href: 'https://github.com/tnobori/snMultiome' },
      { label: 'GitHub (Spatial)', href: 'https://github.com/amonell/Spatial_Plant_Pathogen_Atlas' },
    ],
    image: '/images/projects/primer-cover.jpg',
    imageCredit: 'Hsuan Pai',
    video: null,
  },
  {
    id: 'phytomap',
    title: 'PHYTOMap',
    description:
      'PHYTOMap (Plant HYbridization-based Targeted Observation of gene expression Map) spatially maps expression of dozens of genes at single-molecule resolution in 3D whole-mount plant tissues. No tissue sectioning required \u2014 works in a standard molecular biology lab at low cost and can be applied to many species including non-model species.',
    publication: {
      text: 'Nobori, T.*, Oliva, M., Lister, R. and Ecker, J.R.* (2023) Nature Plants',
      href: 'https://www.nature.com/articles/s41477-023-01439-4',
    },
    resources: [
      { label: 'Protocol', href: 'https://www.protocols.io/view/phytomap-in-arabidopsis-root-tips-rm7vzbp4xvx1/v1' },
    ],
    image: null,
    video: '/images/projects/phytomap.mp4',
  },
  {
    id: 'cell-atlas',
    title: 'Plant Cell Atlas',
    description:
      'A single-nucleus transcriptome atlas of seed-to-seed development employing over 800,000 nuclei, encompassing diverse tissues across ten developmental stages, with spatial transcriptomic validation. This atlas provides a resource for studying cell type specification throughout development and a reference for stimulus response and genetic perturbations at single-cell resolution.',
    publication: {
      text: 'Lee, T.A.*, Nobori, T.*, Illouz-Eliaz, N.*, et al. (2025) Nature Plants',
      href: 'https://www.nature.com/articles/s41477-025-02072-z',
    },
    resources: [
      { label: 'Data Browser', href: 'https://arabidopsisdevatlas.salk.edu/' },
    ],
    image: '/images/projects/atlas_arabidopsis.jpeg',
    video: null,
  },
  {
    id: 'bacterial-omics',
    title: 'In planta bacterial omics',
    description:
      'How do hosts influence bacterial responses? We developed methods to physically isolate bacteria from plant leaves for transcriptome and proteome assays. Key findings: bacterial transcriptome patterns at early infection predict virulence, plant immunity suppresses bacterial iron acquisition, and in planta co-expression analysis identifies novel virulence genes.',
    publications: [
      { text: 'Nobori, T., et al. (2022) EMBO Reports', href: 'https://www.embopress.org/doi/full/10.15252/embr.202255380' },
      { text: 'Nobori, T.*, Wang, Y.*, et al. (2020) Nature Plants', href: 'https://www.nature.com/articles/s41477-020-0690-7' },
      { text: 'Nobori, T., et al. (2018) PNAS', href: 'https://www.pnas.org/doi/abs/10.1073/pnas.1800529115' },
    ],
    resources: [],
    image: '/images/projects/In_planta_bacterial_omics.jpg',
    video: null,
  },
]
