"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Toggle } from "@/components/ui/toggle";

const categories = ["Groceries", "Rent", "Transport", "Fun"];

export default function DesignPage() {
  const [notify, setNotify] = useState(true);
  const [selected, setSelected] = useState("Groceries");

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-6 sm:p-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Component preview</h1>
        <ThemeToggle />
      </header>

      <section className="grid gap-6 sm:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <h2 className="font-semibold">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Add transaction</Button>
            <Button>Cancel</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="font-semibold">Inputs</h2>
          <Input label="Amount" placeholder="0.00" inputMode="decimal" />
          <Input label="Note" defaultValue="Lunch" error="Note is too short" />
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="font-semibold">Toggle and chips</h2>
          <Toggle label="Budget alerts" checked={notify} onChange={setNotify} />
          <div className="flex flex-wrap gap-2">
            {categories.map((name) => (
              <Chip
                key={name}
                selected={selected === name}
                onClick={() => setSelected(name)}
              >
                {name}
              </Chip>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="font-semibold">Progress bars</h2>
          <div className="flex flex-col gap-1">
            <ProgressBar
              value={40}
              max={100}
              label="Transport budget"
              tone="success"
            />
            <p className="text-sm">Transport: on track, $60 left</p>
          </div>
          <div className="flex flex-col gap-1">
            <ProgressBar
              value={85}
              max={100}
              label="Groceries budget"
              tone="warning"
            />
            <p className="text-sm">Groceries: near limit, $15 left</p>
          </div>
          <div className="flex flex-col gap-1">
            <ProgressBar
              value={112}
              max={100}
              label="Fun budget"
              tone="danger"
            />
            <p className="text-sm">Fun: over by $12</p>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        <Card variant="raised">Raised: cards and buttons</Card>
        <Card variant="inset">Inset: inputs, tracks, selected</Card>
        <Card variant="flat">Flat: minor items</Card>
      </section>
    </main>
  );
}
