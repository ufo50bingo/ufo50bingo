import StandardBoardCover from "@/app/StandardBoardCover";

export default function NotStartedBoardCover() {
  return (
    <StandardBoardCover
      isClickable={false}
      content="The board will be revealed when the match is started"
    />
  );
}
