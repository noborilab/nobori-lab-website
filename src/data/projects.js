export const projectsIntro =
  'Plants and microbes interact through heterogeneous and spatially organized cellular states. We aim to understand how these states arise, how they are regulated, and how individual plant and microbial cells influence one another. To address these questions, we combine single-cell and spatial omics with molecular biology, imaging, and computational approaches.\n\nThe themes below highlight selected contributions from our research – discoveries, ideas, methods, datasets, and shared resources – together with what they have enabled and, for ongoing work, where they are heading.'

export const projects = [
  {
    id: 'sc-spatial',
    title: 'Plant immune cell states',
    description:
      'Plants lack specialized and mobile immune cells, so any cell type encountering a pathogen must mount immune responses and communicate with surrounding cells. We integrate time-resolved single-cell transcriptomic, epigenomic, and spatial transcriptomic data to identify the cell states that arise during infection and to describe the gene-regulatory logic specific to each. This work uncovered PRIMER cells, a rare population at the nexus of immune-active hotspots, and motivated a broader framework treating immune cell states as building blocks of the plant immune system.',
    publications: [
      {
        text: 'Nobori, T., Monell, A., et al. (2025) Nature',
        href: 'https://www.nature.com/articles/s41586-024-08383-z',
      },
      {
        label: 'Perspective',
        text: 'Nobori, T. (2025) Cell Host & Microbe',
        href: 'https://www.cell.com/cell-host-microbe/fulltext/S1931-3128(25)00245-8',
      },
    ],
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
    id: 'cell-atlas',
    title: 'Plant Cell Atlas',
    description:
      'We co-built a single-nucleus and spatial transcriptomic atlas spanning the Arabidopsis life cycle. The atlas resolves cellular identities and states across developmental stages and organs, providing a reference for interpreting developmental programs, environmental responses, and genetic perturbations at cellular resolution. The accompanying browser and datasets make this resource directly accessible for exploring new biological questions.',
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
    id: 'regulatory-genomics',
    status: 'Work in progress',
    title: 'Regulatory genomics of plant immunity',
    description:
      'We are building a cell-state-resolved view of the regulatory logic underlying plant immunity. By integrating csRNA-seq, which identifies transcription initiation and active regulatory elements, with single-nucleus transcriptome and chromatin profiling, we aim to connect cis-regulatory elements and transcription-factor combinations to immune programs across cell types and states.',
    publications: [],
    resources: [
      { label: 'Poster (Regulatory elements)', href: 'https://zenodo.org/records/21476383' },
      { label: 'Poster (cis-Regulatory logic)', href: 'https://zenodo.org/records/21476601' },
    ],
    image: '/images/projects/regulatory-genomics.jpg',
    video: null,
  },
  {
    id: 'phytomap',
    title: 'PHYTOMap',
    description:
      'We developed PHYTOMap, a low-cost whole-mount method for multiplexed 3D RNA imaging in plants at single-molecule resolution. It enables spatial gene-expression analysis without tissue sectioning or generating a transgenic reporter for every target, and can be applied across diverse plant tissues and species. We have directly supported more than 10 research groups in implementing PHYTOMap, alongside independent applications of the method beyond our original experimental system.',
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
    id: 'bacterial-omics',
    title: 'In planta bacterial omics',
    description:
      'We developed approaches to profile bacterial transcriptomes and proteomes directly inside plant tissue, allowing bacterial physiology to be studied in its native host environment. These approaches revealed how plant immunity reshapes pathogen physiology, including suppression of bacterial iron acquisition, and identified in planta gene networks associated with virulence. We subsequently extended the framework from pathogens to members of the plant microbiota, enabling simultaneous investigation of host and bacterial responses.',
    publications: [
      { text: 'Nobori, T., et al. (2022) EMBO Reports', href: 'https://www.embopress.org/doi/full/10.15252/embr.202255380' },
      { text: 'Nobori, T.*, Wang, Y.*, et al. (2020) Nature Plants', href: 'https://www.nature.com/articles/s41477-020-0690-7' },
      { text: 'Nobori, T., et al. (2018) PNAS', href: 'https://www.pnas.org/doi/abs/10.1073/pnas.1800529115' },
    ],
    resources: [],
    image: '/images/projects/In_planta_bacterial_omics.jpg',
    video: null,
  },
  {
    id: 'spatial-microbiome',
    status: 'Work in progress',
    title: 'Spatial plant-microbiome interactions',
    description:
      'We are developing spatial approaches to measure plant gene expression together with microbial identity and location in intact tissues. Our goal is to connect where individual microbes colonize with the local plant cell states they encounter and induce, and ultimately to understand plant-microbiome interactions as spatially coupled cellular systems. This work extends PHYTOMap toward simultaneous visualization of host and microbial responses and is complemented by a conceptual framework in which nutrients help organize local interaction niches.',
    publications: [
      {
        label: 'Review',
        text: 'Song, S., Pai, H., Uchida, K., and Nobori, T. (2026) Curr Opin Plant Biol',
        href: 'https://doi.org/10.1016/j.pbi.2026.102939',
      },
    ],
    resources: [
      { label: 'Poster (Spatial co-profiling)', href: 'https://zenodo.org/records/15854638' },
      { label: 'Poster (Single-cell imaging)', href: 'https://zenodo.org/records/22557764' },
    ],
    image: '/images/projects/spatial-microbiome.jpg',
    video: null,
  },
]
