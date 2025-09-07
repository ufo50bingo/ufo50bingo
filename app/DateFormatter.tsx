type Props = {
  unixtime: number;
};

export default function DateFormatter({ unixtime }: Props) {
  return new Date(unixtime * 1000).toLocaleString(undefined, {
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}
