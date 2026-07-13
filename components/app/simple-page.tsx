import { Card, CardContent } from "@/components/ui/card";

export function SimpleAppPage({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-700">LifePilot AI</p>
        <h1 className="mt-2 text-4xl font-semibold text-neutral-950">{title}</h1>
      </div>
      <Card>
        <CardContent>
          <p className="leading-7 text-neutral-600">{description}</p>
        </CardContent>
      </Card>
    </section>
  );
}
