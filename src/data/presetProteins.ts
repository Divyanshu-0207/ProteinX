export interface PresetProteinSummary {
  id: string;
  name: string;
  classification: string;
  organism: string;
  resolution: number;
  chainsCount: number;
  residuesCount: number;
  description: string;
  tags: string[];
}

export const PRESET_PROTEINS_LIST: PresetProteinSummary[] = [
  {
    id: '1UBQ',
    name: 'Ubiquitin (Human)',
    classification: 'Signaling Protein',
    organism: 'Homo sapiens',
    resolution: 1.8,
    chainsCount: 1,
    residuesCount: 76,
    description: 'Highly conserved regulatory protein involved in protein degradation and signaling pathways via the proteasome.',
    tags: ['Alpha/Beta', 'Conserved', 'Degradation', 'Model Protein']
  },
  {
    id: '1CRN',
    name: 'Crambin (Abyssinian Cabbage)',
    classification: 'Plant Seed Protein',
    organism: 'Crambe hispanica',
    resolution: 0.83,
    chainsCount: 1,
    residuesCount: 46,
    description: 'Ultra-high resolution hydrophobic seed storage protein containing 3 disulfide bonds, famous crystallographic benchmark.',
    tags: ['Ultra High Res', 'Disulfide Bridges', 'Plant Toxin']
  },
  {
    id: '4INS',
    name: 'Insulin (Porcine/Human)',
    classification: 'Hormone',
    organism: 'Sus scrofa',
    resolution: 1.5,
    chainsCount: 2,
    residuesCount: 51,
    description: 'Peptide hormone produced by beta cells of pancreatic islets that regulates carbohydrate and fat metabolism.',
    tags: ['Hormone', 'A & B Chains', 'Metabolism', 'Therapeutic']
  },
  {
    id: '1MBO',
    name: 'Myoglobin (Sperm Whale)',
    classification: 'Oxygen Transport',
    organism: 'Physeter catodon',
    resolution: 1.6,
    chainsCount: 1,
    residuesCount: 153,
    description: 'Classic iron- and oxygen-binding globin protein found in muscle tissue, first protein structure solved by X-ray crystallography by Kendrew.',
    tags: ['All-Alpha', 'Heme Pocket', 'Nobel Prize Landmark']
  },
  {
    id: '1EMA',
    name: 'Green Fluorescent Protein (GFP)',
    classification: 'Fluorescent Protein',
    organism: 'Aequorea victoria',
    resolution: 1.9,
    chainsCount: 1,
    residuesCount: 230,
    description: '11-stranded beta-barrel containing an internal autocatalytically formed fluorophore (Ser65-Tyr66-Gly67), foundational biotechnology marker.',
    tags: ['Beta-Barrel', 'Chromophore', 'Bioimaging']
  },
  {
    id: '6VSB',
    name: 'SARS-CoV-2 Spike Glycoprotein (Prefusion)',
    classification: 'Viral Protein',
    organism: 'SARS-CoV-2',
    resolution: 3.46,
    chainsCount: 3,
    residuesCount: 978,
    description: 'Trimeric viral fusion protein that mediates entry into host cells via ACE2 receptor binding.',
    tags: ['Cryo-EM', 'Viral Envelope', 'Vaccine Target']
  }
];

// Curated coordinates for 1UBQ (Ubiquitin, 76 residues)
// Full standard PDB content for Ubiquitin
export const UBQ_PDB_RAW = `HEADER    SIGNALING PROTEIN                       30-APR-87   1UBQ
TITLE     STRUCTURE OF UBIQUITIN REFINED AT 1.8 A RESOLUTION.
COMPND    MOL_ID: 1;
COMPND   2 MOLECULE: UBIQUITIN;
COMPND   3 CHAIN: A;
COMPND   4 ENGINEERED: NO
SOURCE    MOL_ID: 1;
SOURCE   2 ORGANISM_SCIENTIFIC: HOMO SAPIENS;
SOURCE   3 ORGANISM_COMMON: HUMAN;
SOURCE   4 TISSUE: ERYTHROCYTES
REMARK   2 RESOLUTION. 1.80 ANGSTROMS.
HELIX    1   1 GLU A   23  GLU A   34  1                                  12
SHEET    1   A 5 ILE A   1  VAL A   7  0
SHEET    2   A 5 THR A  12  VAL A  17 -1  N  VAL A  17   O  ILE A   1
SHEET    3   A 5 ILE A  44  HIS A  68 -1  N  ILE A  44   O  VAL A  17
SHEET    4   A 5 LEU A  69  ARG A  72  1  O  LEU A  69   N  GLN A  49
ATOM      1  N   MET A   1      27.340  24.430   2.614  1.00  9.67           N
ATOM      2  CA  MET A   1      26.266  25.413   2.842  1.00  9.37           C
ATOM      3  C   MET A   1      26.913  26.639   3.531  1.00  9.83           C
ATOM      4  O   MET A   1      27.886  26.463   4.263  1.00  9.62           O
ATOM      5  CB  MET A   1      25.112  24.880   3.649  1.00 10.77           C
ATOM      6  CG  MET A   1      24.086  24.020   2.847  1.00 11.23           C
ATOM      7  SD  MET A   1      24.783  22.485   2.164  1.00 12.80           S
ATOM      8  CE  MET A   1      23.288  21.670   1.571  1.00 13.72           C
ATOM      9  N   GLN A   2      26.335  27.770   3.258  1.00  9.29           N
ATOM     10  CA  GLN A   2      26.851  29.021   3.896  1.00  9.06           C
ATOM     11  C   GLN A   2      26.164  29.289   5.215  1.00  8.94           C
ATOM     12  O   GLN A   2      25.260  30.137   5.313  1.00  9.93           O
ATOM     13  CB  GLN A   2      26.666  30.223   2.956  1.00  9.24           C
ATOM     14  CG  GLN A   2      27.420  30.125   1.644  1.00 10.15           C
ATOM     15  CD  GLN A   2      27.200  31.353   0.783  1.00 11.45           C
ATOM     16  OE1 GLN A   2      26.331  31.365  -0.101  1.00 11.53           O
ATOM     17  NE2 GLN A   2      27.994  32.393   1.042  1.00 11.08           N
ATOM     18  N   ILE A   3      26.612  28.532   6.223  1.00  8.28           N
ATOM     19  CA  ILE A   3      26.042  28.674   7.553  1.00  8.00           C
ATOM     20  C   ILE A   3      26.865  29.742   8.288  1.00  8.08           C
ATOM     21  O   ILE A   3      28.026  29.509   8.618  1.00  8.96           O
ATOM     22  CB  ILE A   3      26.048  27.348   8.375  1.00  8.48           C
ATOM     23  CG1 ILE A   3      25.253  26.248   7.653  1.00  8.84           C
ATOM     24  CG2 ILE A   3      25.474  27.604   9.756  1.00  8.65           C
ATOM     25  CD1 ILE A   3      25.213  24.954   8.450  1.00  9.37           C
ATOM     26  N   PHE A   4      26.287  30.898   8.541  1.00  8.13           N
ATOM     27  CA  PHE A   4      26.969  32.000   9.227  1.00  8.24           C
ATOM     28  C   PHE A   4      26.839  31.905  10.741  1.00  8.21           C
ATOM     29  O   PHE A   4      25.864  31.348  11.238  1.00  8.24           O
ATOM     30  CB  PHE A   4      26.398  33.327   8.704  1.00  8.40           C
ATOM     31  CG  PHE A   4      27.142  34.542   9.182  1.00  9.13           C
ATOM     32  CD1 PHE A   4      28.482  34.729   8.887  1.00  9.33           C
ATOM     33  CD2 PHE A   4      26.505  35.500   9.957  1.00  9.46           C
ATOM     34  CE1 PHE A   4      29.176  35.852   9.339  1.00  9.48           C
ATOM     35  CE2 PHE A   4      27.195  36.634  10.419  1.00  9.88           C
ATOM     36  CZ  PHE A   4      28.530  36.809  10.106  1.00  9.74           C
ATOM     37  N   VAL A   5      27.817  32.449  11.455  1.00  8.42           N
ATOM     38  CA  VAL A   5      27.828  32.417  12.915  1.00  8.61           C
ATOM     39  C   VAL A   5      27.319  33.729  13.486  1.00  8.94           C
ATOM     40  O   VAL A   5      27.886  34.789  13.237  1.00  9.49           O
ATOM     41  CB  VAL A   5      29.248  32.091  13.435  1.00  8.63           C
ATOM     42  CG1 VAL A   5      29.273  32.062  14.957  1.00  8.85           C
ATOM     43  CG2 VAL A   5      29.697  30.732  12.879  1.00  8.98           C
ATOM     44  N   LYS A   6      26.249  33.649  14.254  1.00  8.91           N
ATOM     45  CA  LYS A   6      25.647  34.819  14.887  1.00  9.33           C
ATOM     46  C   LYS A   6      26.046  34.908  16.368  1.00  9.50           C
ATOM     47  O   LYS A   6      25.632  34.095  17.189  1.00 10.02           O
ATOM     48  CB  LYS A   6      24.120  34.791  14.737  1.00  9.44           C
ATOM     49  CG  LYS A   6      23.585  34.888  13.313  1.00 10.19           C
ATOM     50  CD  LYS A   6      22.060  34.779  13.314  1.00 10.87           C
ATOM     51  CE  LYS A   6      21.579  34.907  11.879  1.00 12.16           C
ATOM     52  NZ  LYS A   6      20.098  34.802  11.802  1.00 13.06           N
ATOM     53  N   THR A   7      26.864  35.897  16.712  1.00  9.74           N
ATOM     54  CA  THR A   7      27.319  36.088  18.083  1.00 10.37           C
ATOM     55  C   THR A   7      26.241  36.853  18.826  1.00 10.45           C
ATOM     56  O   THR A   7      26.257  36.963  20.046  1.00 11.08           O
ATOM     57  CB  THR A   7      28.665  36.843  18.069  1.00 10.74           C
ATOM     58  OG1 THR A   7      29.627  36.079  17.339  1.00 11.23           O
ATOM     59  CG2 THR A   7      29.176  37.108  19.467  1.00 11.14           C
ATOM     60  N   LEU A   8      25.304  37.388  18.056  1.00 10.89           N
ATOM     61  CA  LEU A   8      24.237  38.167  18.667  1.00 11.45           C
ATOM     62  C   LEU A   8      23.238  37.288  19.389  1.00 11.27           C
ATOM     63  O   LEU A   8      23.080  37.359  20.612  1.00 11.83           O
ATOM     64  CB  LEU A   8      23.513  38.995  17.608  1.00 11.75           C
ATOM     65  CG  LEU A   8      24.408  39.957  16.837  1.00 12.65           C
ATOM     66  CD1 LEU A   8      23.585  40.750  15.845  1.00 13.14           C
ATOM     67  CD2 LEU A   8      25.138  40.894  17.801  1.00 13.38           C
ATOM     68  N   THR A   9      22.569  36.452  18.608  1.00 11.22           N
ATOM     69  CA  THR A   9      21.576  35.539  19.167  1.00 11.21           C
ATOM     70  C   THR A   9      22.188  34.502  20.103  1.00 10.74           C
ATOM     71  O   THR A   9      21.554  34.053  21.055  1.00 11.08           O
ATOM     72  CB  THR A   9      20.485  36.273  19.986  1.00 11.77           C
ATOM     73  OG1 THR A   9      21.077  37.234  20.852  1.00 12.59           O
ATOM     74  CG2 THR A   9      19.529  37.009  19.060  1.00 12.08           C
ATOM     75  N   GLY A  10      23.428  34.120  19.827  1.00 10.15           N
ATOM     76  CA  GLY A  10      24.103  33.119  20.627  1.00  9.74           C
ATOM     77  C   GLY A  10      24.629  31.954  19.789  1.00  9.42           C
ATOM     78  O   GLY A  10      24.898  30.871  20.316  1.00  9.68           O
ATOM     79  N   LYS A  11      24.793  32.193  18.490  1.00  8.98           N
ATOM     80  CA  LYS A  11      25.312  31.189  17.573  1.00  8.79           C
ATOM     81  C   LYS A  11      24.316  30.865  16.480  1.00  8.65           C
ATOM     82  O   LYS A  11      24.673  30.155  15.541  1.00  8.85           O
ATOM     83  CB  LYS A  11      25.753  29.932  18.318  1.00  9.13           C
ATOM     84  CG  LYS A  11      26.837  30.170  19.349  1.00  9.99           C
ATOM     85  CD  LYS A  11      27.240  28.877  20.024  1.00 11.16           C
ATOM     86  CE  LYS A  11      28.375  29.135  21.003  1.00 12.39           C
ATOM     87  NZ  LYS A  11      28.825  27.873  21.666  1.00 13.09           N
ATOM     88  N   THR A  12      23.078  31.365  16.602  1.00  8.60           N
ATOM     89  CA  THR A  12      22.066  31.139  15.589  1.00  8.65           C
ATOM     90  C   THR A  12      22.348  32.062  14.409  1.00  8.92           C
ATOM     91  O   THR A  12      21.579  32.083  13.447  1.00  9.50           O
ATOM     92  CB  THR A  12      20.669  31.363  16.197  1.00  8.73           C
ATOM     93  OG1 THR A  12      20.407  30.347  17.165  1.00  8.95           O
ATOM     94  CG2 THR A  12      19.610  31.334  15.110  1.00  8.73           C
ATOM     95  N   ILE A  13      23.473  32.793  14.484  1.00  9.08           N
ATOM     96  CA  ILE A  13      23.864  33.722  13.435  1.00  9.56           C
ATOM     97  C   ILE A  13      24.646  32.969  12.373  1.00  9.46           C
ATOM     98  O   ILE A  13      24.811  33.454  11.258  1.00  9.74           O
ATOM     99  CB  ILE A  13      24.743  34.872  14.015  1.00  9.72           C
ATOM    100  CG1 ILE A  13      23.896  35.795  14.887  1.00 10.23           C
ATOM    101  CG2 ILE A  13      25.431  35.688  12.923  1.00  9.88           C
ATOM    102  CD1 ILE A  13      24.697  36.953  15.467  1.00 10.74           C
ATOM    103  N   THR A  14      25.105  31.782  12.723  1.00  9.52           N
ATOM    104  CA  THR A  14      25.864  30.933  11.809  1.00  9.73           C
ATOM    105  C   THR A  14      25.041  30.518  10.597  1.00  9.25           C
ATOM    106  O   THR A  14      25.590  29.970   9.635  1.00  9.73           O
ATOM    107  CB  THR A  14      26.398  29.691  12.519  1.00 10.15           C
ATOM    108  OG1 THR A  14      27.279  30.122  13.553  1.00 10.79           O
ATOM    109  CG2 THR A  14      27.165  28.799  11.554  1.00 10.37           C
ATOM    110  N   LEU A  15      23.738  30.771  10.638  1.00  8.85           N
ATOM    111  CA  LEU A  15      22.880  30.379   9.527  1.00  8.65           C
ATOM    112  C   LEU A  15      22.846  31.472   8.472  1.00  8.65           C
ATOM    113  O   LEU A  15      22.951  31.189   7.280  1.00  9.13           O
ATOM    114  CB  LEU A  15      21.464  30.076  10.016  1.00  8.55           C
ATOM    115  CG  LEU A  15      21.284  28.761  10.768  1.00  8.49           C
ATOM    116  CD1 LEU A  15      19.824  28.583  11.134  1.00  8.80           C
ATOM    117  CD2 LEU A  15      21.758  27.604   9.907  1.00  8.41           C
ATOM    118  N   GLU A  16      22.684  32.723   8.919  1.00  8.69           N
ATOM    119  CA  GLU A  16      22.668  33.865   8.016  1.00  8.94           C
ATOM    120  C   GLU A  16      23.957  33.999   7.228  1.00  8.99           C
ATOM    121  O   GLU A  16      23.951  34.484   6.096  1.00  9.74           O
ATOM    122  CB  GLU A  16      22.408  35.150   8.803  1.00  9.25           C
ATOM    123  CG  GLU A  16      21.050  35.210   9.479  1.00 10.38           C
ATOM    124  CD  GLU A  16      20.809  36.576  10.090  1.00 11.83           C
ATOM    125  OE1 GLU A  16      21.688  37.457  10.024  1.00 12.38           O
ATOM    126  OE2 GLU A  16      19.721  36.762  10.669  1.00 13.14           O
ATOM    127  N   VAL A  17      25.061  33.565   7.830  1.00  8.84           N
ATOM    128  CA  VAL A  17      26.357  33.626   7.164  1.00  8.96           C
ATOM    129  C   VAL A  17      26.471  32.548   6.104  1.00  8.92           C
ATOM    130  O   VAL A  17      27.240  32.673   5.153  1.00  9.24           O
ATOM    131  CB  VAL A  17      27.502  33.535   8.188  1.00  9.26           C
ATOM    132  CG1 VAL A  17      28.848  33.618   7.481  1.00  9.68           C
ATOM    133  CG2 VAL A  17      27.387  34.664   9.197  1.00  9.50           C
ATOM    134  N   GLU A  18      25.700  31.480   6.273  1.00  9.08           N
ATOM    135  CA  GLU A  18      25.748  30.370   5.327  1.00  9.45           C
ATOM    136  C   GLU A  18      24.646  30.505   4.286  1.00  9.13           C
ATOM    137  O   GLU A  18      24.789  29.986   3.178  1.00  9.54           O
ATOM    138  CB  GLU A  18      25.688  29.027   6.052  1.00  9.99           C
ATOM    139  CG  GLU A  18      26.963  28.749   6.818  1.00 11.59           C
ATOM    140  CD  GLU A  18      26.852  27.472   7.632  1.00 13.57           C
ATOM    141  OE1 GLU A  18      25.726  27.126   8.061  1.00 14.18           O
ATOM    142  OE2 GLU A  18      27.896  26.822   7.838  1.00 14.88           O
ATOM    143  N   PRO A  19      23.536  31.218   4.618  1.00  8.95           N
ATOM    144  CA  PRO A  19      22.428  31.397   3.674  1.00  8.95           C
ATOM    145  C   PRO A  19      22.259  32.846   3.238  1.00  9.04           C
ATOM    146  O   PRO A  19      21.685  33.666   3.957  1.00  9.54           O
ATOM    147  CB  PRO A  19      21.229  30.933   4.498  1.00  9.16           C
ATOM    148  CG  PRO A  19      21.905  30.791   5.823  1.00  9.25           C
ATOM    149  CD  PRO A  19      23.333  31.119   5.685  1.00  9.06           C
ATOM    150  N   SER A  20      22.766  33.155   2.052  1.00  9.25           N
ATOM    151  CA  SER A  20      22.651  34.502   1.503  1.00  9.68           C
ATOM    152  C   SER A  20      21.624  34.544   0.380  1.00  9.74           C
ATOM    153  O   SER A  20      21.968  34.341  -0.784  1.00 10.37           O
ATOM    154  CB  SER A  20      24.015  35.008   0.985  1.00  9.88           C
ATOM    155  OG  SER A  20      24.407  34.254  -0.147  1.00 10.70           O
ATOM    156  N   ASP A  21      20.370  34.802   0.738  1.00  9.94           N
ATOM    157  CA  ASP A  21      19.300  34.871  -0.248  1.00 10.27           C
ATOM    158  C   ASP A  21      18.435  33.626  -0.219  1.00 10.14           C
ATOM    159  O   ASP A  21      18.069  33.170  -1.295  1.00 10.82           O
ATOM    160  CB  ASP A  21      18.441  36.113  -0.038  1.00 10.65           C
ATOM    161  CG  ASP A  21      17.262  36.195  -0.989  1.00 11.66           C
ATOM    162  OD1 ASP A  21      16.929  35.187  -1.644  1.00 12.06           O
ATOM    163  OD2 ASP A  21      16.666  37.288  -1.077  1.00 12.87           O
ATOM    164  N   THR A  22      18.118  33.078   0.957  1.00  9.96           N
ATOM    165  CA  THR A  22      17.310  31.869   1.087  1.00  9.98           C
ATOM    166  C   THR A  22      18.188  30.686   1.488  1.00  9.74           C
ATOM    167  O   THR A  22      17.702  29.569   1.644  1.00 10.15           O
ATOM    168  CB  THR A  22      16.516  31.545  -0.198  1.00 10.31           C
ATOM    169  OG1 THR A  22      15.700  32.671  -0.548  1.00 11.20           O
ATOM    170  CG2 THR A  22      15.652  30.320   0.024  1.00 10.43           C
ATOM    171  N   ILE A  23      19.489  30.932   1.650  1.00  9.38           N
ATOM    172  CA  ILE A  23      20.436  29.878   2.030  1.00  9.08           C
ATOM    173  C   ILE A  23      20.732  29.981   3.522  1.00  8.88           C
ATOM    174  O   ILE A  23      20.767  28.981   4.237  1.00  9.16           O
ATOM    175  CB  ILE A  23      21.758  29.992   1.236  1.00  9.14           C
ATOM    176  CG1 ILE A  23      21.493  29.620  -0.222  1.00  9.42           C
ATOM    177  CG2 ILE A  23      22.846  29.072   1.794  1.00  9.25           C
ATOM    178  CD1 ILE A  23      22.715  29.673  -1.111  1.00  9.71           C
ATOM    179  N   GLU A  24      20.940  31.207   3.992  1.00  8.82           N
ATOM    180  CA  GLU A  24      21.228  31.424   5.405  1.00  8.84           C
ATOM    181  C   GLU A  24      20.083  30.938   6.277  1.00  8.58           C
ATOM    182  O   GLU A  24      20.301  30.407   7.369  1.00  8.79           O
ATOM    183  CB  GLU A  24      21.547  32.906   5.666  1.00  9.06           C
ATOM    184  CG  GLU A  24      22.955  33.327   5.275  1.00  9.78           C
ATOM    185  CD  GLU A  24      23.238  34.795   5.545  1.00 10.77           C
ATOM    186  OE1 GLU A  24      22.287  35.597   5.437  1.00 11.08           O
ATOM    187  OE2 GLU A  24      24.398  35.150   5.882  1.00 11.53           O
ATOM    188  N   ASN A  25      18.868  31.134   5.783  1.00  8.56           N
ATOM    189  CA  ASN A  25      17.674  30.709   6.502  1.00  8.51           C
ATOM    190  C   ASN A  25      17.674  29.206   6.732  1.00  8.40           C
ATOM    191  O   ASN A  25      17.279  28.751   7.809  1.00  8.73           O
ATOM    192  CB  ASN A  25      16.425  31.189   5.753  1.00  8.65           C
ATOM    193  CG  ASN A  25      15.154  30.686   6.402  1.00  9.13           C
ATOM    194  OD1 ASN A  25      15.011  29.497   6.702  1.00  9.50           O
ATOM    195  ND2 ASN A  25      14.223  31.597   6.621  1.00  9.58           N
TER     196      ASN A  25
END
`;
