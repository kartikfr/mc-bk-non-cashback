const TrustedBanks = () => {
  const banks = [
    "HDFC Bank",
    "ICICI Bank", 
    "SBI Cards",
    "Axis Bank",
    "Kotak Mahindra",
    "American Express"
  ];

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs uppercase tracking-wider text-muted-foreground mb-8 font-semibold">
          Trusted Partner Banks
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {banks.map((bank, index) => (
            <div
              key={index}
              className="text-charcoal-500 font-semibold text-sm md:text-base opacity-60 hover:opacity-100 transition-opacity"
            >
              {bank}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBanks;
