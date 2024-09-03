import type { MetaFunction } from "@remix-run/node";
import {
  ClientActionFunctionArgs,
  Form,
  useActionData,
} from "@remix-run/react";
import {
  addMonths,
  differenceInDays,
  differenceInMonths,
  endOfMonth,
  isAfter,
  isSameDay,
  startOfMonth,
} from "date-fns";
import { FC } from "react";

export const meta: MetaFunction = () => {
  return [{ title: "Kyukai kun proto" }];
};

const Page: FC = () => {
  const actionData = useActionData<typeof clientAction>();

  return (
    <main className="mx-auto max-w-sm">
      <h1>Kyukai kun proto</h1>
      <section>
        <h2>日付を入力</h2>
        <Form method="post" className="flex flex-col">
          <label>
            休会開始日
            <input type="date" name="start" />
          </label>
          <label>
            休会終了予定日
            <input type="date" name="end" />
          </label>
          {actionData && actionData?.errors.length !== 0 && (
            <ul className="text-red-500">
              {actionData.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
          <button type="submit" className="bg-blue-500 text-white">
            計算する
          </button>
        </Form>
      </section>
      {actionData && actionData.freeMonths.length !== 0 && (
        <section>
          <h2>会費をスキップできる月</h2>
          <ul>
            {actionData.freeMonths.map((month, index) => (
              <li key={index}>{month}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
};
export default Page;

export const clientAction = async ({ request }: ClientActionFunctionArgs) => {
  const formData = await request.formData();

  const start = formData.get("start")?.toString();
  const end = formData.get("end")?.toString();

  if (!start || !end) {
    return {
      errors: [
        !start && "休会開始日を入力してください",
        !end && "休会終了予定日を入力してください",
      ],
      freeMonths: [],
    };
  }

  const isStartOfMonth = isSameDay(startOfMonth(start), new Date(start));
  const isEndOfMonth = isSameDay(endOfMonth(end), new Date(end));
  if (!isStartOfMonth || !isEndOfMonth) {
    return {
      errors: [
        !isStartOfMonth && "休会開始日には月初日を入力してください",
        !isEndOfMonth && "休会終了日には月末日を入力してください",
      ].filter((error) => typeof error === "string"),
      freeMonths: [],
    };
  }

  if (isAfter(start, end)) {
    return {
      errors: ["休会終了日には休会開始日より後の日付を入力してください"],
      freeMonths: [],
    };
  }

  if (differenceInDays(end, start) > 90) {
    return {
      errors: ["休会期間は90日以内にしてください"],
      freeMonths: [],
    };
  }

  const freeMonths = Array.from(
    { length: differenceInMonths(end, start) + 1 },
    (_, i) => addMonths(start, i).getMonth() + 1
  )
    .map((month) => (month === 1 ? 12 : month - 1))
    .map((month) => `${month}月`);

  return {
    errors: [],
    freeMonths,
  };
};
