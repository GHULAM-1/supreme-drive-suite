import { Shield, Lock, Crown, Award } from "lucide-react";

const trustPoints = [
  {
    icon: Shield,
    title: "Safety & Security",
    description: "Military-grade security protocols and fully insured services"
  },
  {
    icon: Lock,
    title: "Privacy & Discretion",
    description: "Absolute confidentiality and NDAs for all high-profile clients"
  },
  {
    icon: Crown,
    title: "Luxury Fleet",
    description: "Premium vehicles maintained to the highest standards"
  },
  {
    icon: Award,
    title: "Professional Excellence",
    description: "Elite team with decades of combined experience"
  }
];

const TrustBadges = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                className="flex flex-col items-center text-center space-y-4 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full" />
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center border border-accent/30">
                    <Icon className="w-8 h-8 text-accent" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">{point.title}</h3>
                  <p className="text-sm text-muted-foreground">{point.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
