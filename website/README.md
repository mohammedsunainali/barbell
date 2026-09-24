# Barbell website

`index.html` uses the supplied BARBELL Design System V1 landing-page hierarchy, local Poppins fonts and official outlined logo assets. The three images in `screens/` are screenshots inherited from the actual openGym application; they are marked as the current product UI and are not Barbell release images.

`docs.html`, `api.html` and `about.html` preserve the inherited upstream reference text and links under an explicit provenance notice. They need a dedicated content and release audit before being presented as Barbell release documentation. The historical site build flow and `build-images.sh` have not been repointed to a Barbell production domain.

The workout and exercise-library captures were deliberately excluded because they display third-party exercise artwork. Do not bundle those captures in marketing without verifying rights.
