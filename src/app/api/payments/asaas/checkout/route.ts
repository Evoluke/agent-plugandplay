import { NextResponse } from "next/server";

type CheckoutBody = {
  customer: {
    name: string;
    email: string;
    cpfCnpj?: string;
    phone?: string;
  };
  planId?: string;
  value?: number;
  description?: string;
  redirectUrl?: string;
};

const ASAAS_BASE_URL = process.env.ASAAS_BASE_URL ?? "https://www.asaas.com/api/v3";

export async function POST(request: Request) {
  if (!process.env.ASAAS_API_KEY) {
    return NextResponse.json({ message: "ASAAS_API_KEY não configurada" }, { status: 500 });
  }

  const body = (await request.json()) as CheckoutBody;
  if (!body.customer?.email) {
    return NextResponse.json({ message: "Dados do cliente são obrigatórios" }, { status: 400 });
  }

  try {
    const createCustomerResponse = await fetch(`${ASAAS_BASE_URL}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.ASAAS_API_KEY,
      },
      body: JSON.stringify({
        name: body.customer.name,
        email: body.customer.email,
        cpfCnpj: body.customer.cpfCnpj,
        mobilePhone: body.customer.phone,
        notificationsEnabled: true,
      }),
    });

    const customerData = await createCustomerResponse.json();
    if (!createCustomerResponse.ok) {
      return NextResponse.json({ message: customerData?.errors?.[0]?.description ?? "Erro ao criar cliente" }, {
        status: 502,
      });
    }

    const subscriptionResponse = await fetch(`${ASAAS_BASE_URL}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.ASAAS_API_KEY,
      },
      body: JSON.stringify({
        customer: customerData.id,
        billingType: "CREDIT_CARD",
        cycle: "MONTHLY",
        value: body.value ?? 29,
        description: body.description ?? "Assinatura Currículo IA Pro",
        externalReference: body.planId,
        nextDueDate: new Date().toISOString().slice(0, 10),
      }),
    });

    const subscriptionData = await subscriptionResponse.json();
    if (!subscriptionResponse.ok) {
      return NextResponse.json({ message: subscriptionData?.errors?.[0]?.description ?? "Erro ao criar assinatura" }, {
        status: 502,
      });
    }

    const checkoutResponse = await fetch(`${ASAAS_BASE_URL}/payments/${subscriptionData.charge?.id}/authorize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.ASAAS_API_KEY,
      },
      body: JSON.stringify({
        callbackUrl: body.redirectUrl ?? "https://curriculo-ia.pro/dashboard",
      }),
    });

    const checkoutData = await checkoutResponse.json();
    if (!checkoutResponse.ok) {
      return NextResponse.json({ message: checkoutData?.errors?.[0]?.description ?? "Erro ao gerar checkout" }, {
        status: 502,
      });
    }

    return NextResponse.json(
      {
        checkoutUrl: checkoutData?.checkoutUrl ?? checkoutData?.invoiceUrl,
        subscriptionId: subscriptionData.id,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erro ao integrar com Asaas" }, { status: 500 });
  }
}
