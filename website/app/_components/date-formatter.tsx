// import { parseISO, format } from "date-fns";
import { useLocale } from "next-intl";

type Props = {
  dateString: string;
};

const DateFormatter = ({ dateString }: Props) => {
  const locale = useLocale();
  const date = new Date(dateString);

  // Use the native Intl.DateTimeFormat to format the date based on the current locale
  const formattedDate = new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);

  return <time dateTime={dateString}>{formattedDate}</time>;
};

export default DateFormatter;
